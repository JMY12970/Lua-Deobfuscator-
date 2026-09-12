/**
 * AI Lua/Luau Deobfuscator - Static Analysis Pipeline
 * Implements Stages 1 through 7 + Static Simplification & Validation
 * Treats all code strictly as DATA. Never evaluates or executes code.
 */

import {
  AnalyzedFunction,
  ConstantFolding,
  ControlFlowPattern,
  DecodedString,
  DetectedLanguage,
  InferredIdentifier,
  RobloxApiUsage,
  SecurityWarning,
  StaticAnalysisResult,
  TokenInfo,
  ValidationIssue
} from '../types';

const LUA_KEYWORDS = new Set([
  'and', 'break', 'do', 'else', 'elseif', 'end', 'false', 'for', 'function',
  'if', 'in', 'local', 'nil', 'not', 'or', 'repeat', 'return', 'then',
  'true', 'until', 'while', 'continue', 'export', 'type'
]);

const ROBLOX_SERVICES = [
  'Players', 'Workspace', 'ReplicatedStorage', 'ServerStorage', 'ServerScriptService',
  'StarterGui', 'StarterPack', 'StarterPlayer', 'Lighting', 'SoundService',
  'TweenService', 'RunService', 'UserInputService', 'ContextActionService',
  'HttpService', 'TeleportService', 'MarketplaceService', 'BadgeService',
  'DataStoreService', 'Debris', 'CoreGui', 'GuiService'
];

/**
 * Language Detector
 */
export function detectLanguage(code: string): DetectedLanguage {
  let luauScore = 0;
  let luaScore = 0;

  // Luau specifics
  if (/\b(export\s+type|type\s+[A-Za-z0-9_]+\s*=)/.test(code)) luauScore += 4;
  if (/(\+=|-=|\*=\|\/=|%=|\^=|\.\.=)/.test(code)) luauScore += 3;
  if (/\bcontinue\b/.test(code)) luauScore += 3;
  if (/\btask\.(wait|spawn|defer|delay|cancel)\b/.test(code)) luauScore += 4;
  if (/\bgame\s*:\s*GetService\b/.test(code)) luauScore += 3;
  if (/\bInstance\.new\b/.test(code)) luauScore += 3;
  if (/\b(Players\.LocalPlayer|workspace\.CurrentCamera)\b/.test(code)) luauScore += 3;
  if (/:\s*(string|number|boolean|any|thread|buffer|vector)\b/.test(code)) luauScore += 3;

  // Standard Lua patterns
  if (/\b(setmetatable|getmetatable|coroutine\.create|rawset|rawget)\b/.test(code)) luaScore += 2;
  if (/\bfunction\b/.test(code)) luaScore += 1;
  if (/\blocal\b/.test(code)) luaScore += 1;

  if (luauScore >= 3) return 'Luau';
  if (luaScore > 0 || code.trim().length > 0) return 'Lua';
  return 'Unknown';
}

/**
 * STAGE 1 — LEXICAL ANALYSIS
 */
export function tokenizeLua(code: string): TokenInfo[] {
  const tokens: TokenInfo[] = [];
  let pos = 0;
  let line = 1;
  let col = 1;

  const length = code.length;

  while (pos < length) {
    const char = code[pos];

    // Newlines
    if (char === '\n') {
      line++;
      col = 1;
      pos++;
      continue;
    }

    // Whitespace
    if (/\s/.test(char)) {
      pos++;
      col++;
      continue;
    }

    // Comments: -- or --[[ ... ]]
    if (char === '-' && code[pos + 1] === '-') {
      const startCol = col;
      pos += 2;
      col += 2;
      let commentVal = '--';

      if (code[pos] === '[' && code[pos + 1] === '[') {
        pos += 2;
        col += 2;
        commentVal += '[[';
        while (pos < length && !(code[pos] === ']' && code[pos + 1] === ']')) {
          if (code[pos] === '\n') { line++; col = 0; }
          commentVal += code[pos];
          pos++;
          col++;
        }
        if (pos < length) {
          commentVal += ']]';
          pos += 2;
          col += 2;
        }
      } else {
        while (pos < length && code[pos] !== '\n') {
          commentVal += code[pos];
          pos++;
          col++;
        }
      }

      tokens.push({ type: 'comment', value: commentVal, line, col: startCol });
      continue;
    }

    // Strings: "..." or '...' or [[...]]
    if (char === '"' || char === "'") {
      const quote = char;
      const startCol = col;
      let strVal = quote;
      pos++;
      col++;

      while (pos < length) {
        const c = code[pos];
        strVal += c;
        pos++;
        col++;
        if (c === '\\' && pos < length) {
          strVal += code[pos];
          pos++;
          col++;
          continue;
        }
        if (c === quote) break;
      }

      tokens.push({ type: 'string', value: strVal, line, col: startCol });
      continue;
    }

    // Multiline string [[ ... ]]
    if (char === '[' && code[pos + 1] === '[') {
      const startCol = col;
      let strVal = '[[';
      pos += 2;
      col += 2;
      while (pos < length && !(code[pos] === ']' && code[pos + 1] === ']')) {
        if (code[pos] === '\n') { line++; col = 0; }
        strVal += code[pos];
        pos++;
        col++;
      }
      if (pos < length) {
        strVal += ']]';
        pos += 2;
        col += 2;
      }
      tokens.push({ type: 'string', value: strVal, line, col: startCol });
      continue;
    }

    // Numbers: hex 0x..., decimals, scientific
    if (/[0-9]/.test(char) || (char === '.' && /[0-9]/.test(code[pos + 1] || ''))) {
      const startCol = col;
      let numVal = '';
      if (char === '0' && (code[pos + 1] === 'x' || code[pos + 1] === 'X')) {
        numVal += code.substring(pos, pos + 2);
        pos += 2;
        col += 2;
        while (pos < length && /[0-9a-fA-F]/.test(code[pos])) {
          numVal += code[pos];
          pos++;
          col++;
        }
      } else {
        while (pos < length && /[0-9a-zA-Z._]/.test(code[pos])) {
          numVal += code[pos];
          pos++;
          col++;
        }
      }
      tokens.push({ type: 'number', value: numVal, line, col: startCol });
      continue;
    }

    // Identifiers & Keywords
    if (/[a-zA-Z_]/.test(char)) {
      const startCol = col;
      let idVal = '';
      while (pos < length && /[a-zA-Z0-9_]/.test(code[pos])) {
        idVal += code[pos];
        pos++;
        col++;
      }
      const type = LUA_KEYWORDS.has(idVal) ? 'keyword' : 'identifier';
      tokens.push({ type, value: idVal, line, col: startCol });
      continue;
    }

    // Operators & Symbols
    const twoChars = code.substring(pos, pos + 2);
    if (['==', '~=', '<=', '>=', '..', '::', '+=', '-=', '*=', '/=', '%=', '^='].includes(twoChars)) {
      tokens.push({ type: 'operator', value: twoChars, line, col });
      pos += 2;
      col += 2;
      continue;
    }

    tokens.push({ type: 'symbol', value: char, line, col });
    pos++;
    col++;
  }

  return tokens;
}

/**
 * STAGE 2 — STRING ANALYSIS
 * Safely decodes escaped strings, byte sequences, string.char(...), string concatenations
 */
export function analyzeAndDecodeStrings(code: string): DecodedString[] {
  const results: DecodedString[] = [];
  const seen = new Set<string>();

  // 1. string.char(...) patterns e.g. string.char(104, 101, 108, 108, 111)
  const stringCharRegex = /string\.char\s*\(\s*([0-9\s,]+)\s*\)/g;
  let match: RegExpExecArray | null;
  while ((match = stringCharRegex.exec(code)) !== null) {
    const raw = match[0];
    if (seen.has(raw)) continue;
    seen.add(raw);
    try {
      const numbers = match[1].split(',').map(n => parseInt(n.trim(), 10)).filter(n => !isNaN(n));
      if (numbers.length > 0 && numbers.every(n => n >= 0 && n <= 255)) {
        const decoded = String.fromCharCode(...numbers);
        results.push({
          original: raw,
          decoded: JSON.stringify(decoded),
          type: 'string_char'
        });
      }
    } catch {
      // safe fallback
    }
  }

  // 2. Hex escapes in strings: "\x68\x65\x6c\x6c\x6f"
  const hexEscapeRegex = /"((?:\\x[0-9a-fA-F]{2})+)"|'((?:\\x[0-9a-fA-F]{2})+)'/g;
  while ((match = hexEscapeRegex.exec(code)) !== null) {
    const raw = match[0];
    if (seen.has(raw)) continue;
    seen.add(raw);
    const inner = match[1] || match[2];
    try {
      const bytes = inner.split('\\x').filter(Boolean).map(h => parseInt(h, 16));
      const decoded = String.fromCharCode(...bytes);
      results.push({
        original: raw,
        decoded: JSON.stringify(decoded),
        type: 'hex_escape'
      });
    } catch {
      // safe fallback
    }
  }

  // 3. Decimal escapes in strings: "\104\101\108\108\111"
  const decEscapeRegex = /"((?:\\[0-9]{1,3})+)"|'((?:\\[0-9]{1,3})+)'/g;
  while ((match = decEscapeRegex.exec(code)) !== null) {
    const raw = match[0];
    if (seen.has(raw)) continue;
    seen.add(raw);
    const inner = match[1] || match[2];
    try {
      const nums = inner.split('\\').filter(Boolean).map(d => parseInt(d, 10));
      if (nums.every(n => n >= 0 && n <= 255)) {
        const decoded = String.fromCharCode(...nums);
        results.push({
          original: raw,
          decoded: JSON.stringify(decoded),
          type: 'decimal_escape'
        });
      }
    } catch {
      // safe fallback
    }
  }

  // 4. Constant string concatenations: "foo" .. "bar"
  const concatRegex = /(["'][^"'\\]*(?:\\.[^"'\\]*)*["'])\s*\.\.\s*(["'][^"'\\]*(?:\\.[^"'\\]*)*["'])/g;
  while ((match = concatRegex.exec(code)) !== null) {
    const raw = match[0];
    if (seen.has(raw)) continue;
    seen.add(raw);
    try {
      const s1 = match[1].slice(1, -1);
      const s2 = match[2].slice(1, -1);
      results.push({
        original: raw,
        decoded: JSON.stringify(s1 + s2),
        type: 'concatenation'
      });
    } catch {
      // safe fallback
    }
  }

  // 5. String reverse: string.reverse("olleh")
  const reverseRegex = /string\.reverse\s*\(\s*(["'][^"']+["'])\s*\)/g;
  while ((match = reverseRegex.exec(code)) !== null) {
    const raw = match[0];
    if (seen.has(raw)) continue;
    seen.add(raw);
    try {
      const content = match[1].slice(1, -1);
      const reversed = content.split('').reverse().join('');
      results.push({
        original: raw,
        decoded: JSON.stringify(reversed),
        type: 'reversed'
      });
    } catch {
      // safe fallback
    }
  }

  return results;
}

/**
 * STAGE 3 — CONSTANT ANALYSIS
 * Identifies constant arithmetic, hex numbers, unnecessary conversions
 */
export function analyzeConstants(code: string): ConstantFolding[] {
  const foldings: ConstantFolding[] = [];
  const seen = new Set<string>();

  // 1. Hex numbers to decimal representations for clarity
  const hexNumRegex = /\b0x([0-9a-fA-F]+)\b/g;
  let match: RegExpExecArray | null;
  while ((match = hexNumRegex.exec(code)) !== null) {
    const raw = match[0];
    if (seen.has(raw)) continue;
    seen.add(raw);
    const dec = parseInt(match[1], 16);
    if (!isNaN(dec)) {
      foldings.push({
        original: raw,
        simplified: dec.toString(),
        type: 'hex_number'
      });
    }
  }

  // 2. Safe constant arithmetic: e.g. (10 + 20) or 5 * 10
  const arithRegex = /\b([0-9]+)\s*([\+\-\*\/])\s*([0-9]+)\b/g;
  while ((match = arithRegex.exec(code)) !== null) {
    const raw = match[0];
    if (seen.has(raw)) continue;
    seen.add(raw);
    const n1 = parseFloat(match[1]);
    const op = match[2];
    const n2 = parseFloat(match[3]);
    let res: number | null = null;
    if (op === '+') res = n1 + n2;
    else if (op === '-') res = n1 - n2;
    else if (op === '*') res = n1 * n2;
    else if (op === '/' && n2 !== 0) res = n1 / n2;

    if (res !== null && isFinite(res)) {
      foldings.push({
        original: raw,
        simplified: res.toString(),
        type: 'arithmetic'
      });
    }
  }

  // 3. tonumber("123") -> 123
  const tonumberRegex = /tonumber\s*\(\s*(["']([0-9]+)["'])\s*\)/g;
  while ((match = tonumberRegex.exec(code)) !== null) {
    const raw = match[0];
    if (seen.has(raw)) continue;
    seen.add(raw);
    foldings.push({
      original: raw,
      simplified: match[2],
      type: 'type_conversion'
    });
  }

  return foldings;
}

/**
 * STAGE 4 — IDENTIFIER ANALYSIS
 * Detects meaningless/obfuscated names and infers semantic names from usage with confidence
 */
export function analyzeIdentifiers(code: string, tokens: TokenInfo[]): InferredIdentifier[] {
  const inferredMap = new Map<string, InferredIdentifier>();

  // Count identifier occurrences
  const idCounts = new Map<string, number>();
  for (const tok of tokens) {
    if (tok.type === 'identifier') {
      idCounts.set(tok.value, (idCounts.get(tok.value) || 0) + 1);
    }
  }

  // Helper to check if identifier is meaningless/obfuscated
  const isObfuscatedName = (name: string): boolean => {
    if (name.length <= 2) return true; // a, b, c, x1
    if (/^[a-zA-Z][0-9]+$/.test(name)) return true; // v17, x2, L0
    if (/^_[0-9a-fA-FxX_]+$/.test(name)) return true; // _0x1234
    if (/^(__l_|__v_|o_|III_|lII_|IlI_)/.test(name)) return true; // common Lua obfuscator prefixes
    if (/^[Il1O0_]{4,}$/.test(name)) return true; // barcode identifiers
    return false;
  };

  // Inference Rules:
  // Rule 1: local x = game:GetService("Service")
  const serviceAssignRegex = /local\s+([a-zA-Z0-9_]+)\s*=\s*game\s*:\s*GetService\s*\(\s*["']([a-zA-Z0-9_]+)["']\s*\)/g;
  let match: RegExpExecArray | null;
  while ((match = serviceAssignRegex.exec(code)) !== null) {
    const original = match[1];
    const serviceName = match[2];
    if (isObfuscatedName(original)) {
      const camelCase = serviceName.charAt(0).toLowerCase() + serviceName.slice(1);
      inferredMap.set(original, {
        original,
        inferred: camelCase,
        reason: `Assigned from game:GetService("${serviceName}")`,
        confidence: 96,
        occurrences: idCounts.get(original) || 1
      });
    }
  }

  // Rule 2: local x = Players.LocalPlayer
  const playerAssignRegex = /local\s+([a-zA-Z0-9_]+)\s*=\s*(?:[a-zA-Z0-9_]+\.)?Players\.LocalPlayer/g;
  while ((match = playerAssignRegex.exec(code)) !== null) {
    const original = match[1];
    if (isObfuscatedName(original)) {
      inferredMap.set(original, {
        original,
        inferred: 'localPlayer',
        reason: 'Assigned from Players.LocalPlayer',
        confidence: 95,
        occurrences: idCounts.get(original) || 1
      });
    }
  }

  // Rule 3: local x = workspace.CurrentCamera
  const cameraAssignRegex = /local\s+([a-zA-Z0-9_]+)\s*=\s*workspace\.CurrentCamera/g;
  while ((match = cameraAssignRegex.exec(code)) !== null) {
    const original = match[1];
    if (isObfuscatedName(original)) {
      inferredMap.set(original, {
        original,
        inferred: 'camera',
        reason: 'Assigned from workspace.CurrentCamera',
        confidence: 94,
        occurrences: idCounts.get(original) || 1
      });
    }
  }

  // Rule 4: local x = Instance.new("Part")
  const instanceNewRegex = /local\s+([a-zA-Z0-9_]+)\s*=\s*Instance\.new\s*\(\s*["']([a-zA-Z0-9_]+)["']\s*\)/g;
  while ((match = instanceNewRegex.exec(code)) !== null) {
    const original = match[1];
    const className = match[2];
    if (isObfuscatedName(original)) {
      const camelCase = className.charAt(0).toLowerCase() + className.slice(1);
      inferredMap.set(original, {
        original,
        inferred: camelCase,
        reason: `Created with Instance.new("${className}")`,
        confidence: 90,
        occurrences: idCounts.get(original) || 1
      });
    }
  }

  // Rule 5: local x = HttpService:JSONDecode(...)
  const jsonDecodeRegex = /local\s+([a-zA-Z0-9_]+)\s*=\s*(?:[a-zA-Z0-9_]+:)?JSONDecode\s*\(/g;
  while ((match = jsonDecodeRegex.exec(code)) !== null) {
    const original = match[1];
    if (isObfuscatedName(original) && !inferredMap.has(original)) {
      inferredMap.set(original, {
        original,
        inferred: 'decodedData',
        reason: 'Result of JSONDecode',
        confidence: 88,
        occurrences: idCounts.get(original) || 1
      });
    }
  }

  // Rule 6: for i, v in pairs(...)
  const forPairsRegex = /for\s+([a-zA-Z0-9_]+)\s*,\s*([a-zA-Z0-9_]+)\s+in\s+(?:pairs|ipairs)\s*\(/g;
  while ((match = forPairsRegex.exec(code)) !== null) {
    const k = match[1];
    const v = match[2];
    if (isObfuscatedName(k) && !inferredMap.has(k)) {
      inferredMap.set(k, {
        original: k,
        inferred: 'key',
        reason: 'Iterator key in pairs loop',
        confidence: 85,
        occurrences: idCounts.get(k) || 1
      });
    }
    if (isObfuscatedName(v) && !inferredMap.has(v)) {
      inferredMap.set(v, {
        original: v,
        inferred: 'item',
        reason: 'Iterator value in pairs loop',
        confidence: 85,
        occurrences: idCounts.get(v) || 1
      });
    }
  }

  return Array.from(inferredMap.values());
}

/**
 * STAGE 5 — FUNCTION ANALYSIS
 * Analyzes function inputs, outputs, local variables, services, side effects, and estimated purpose
 */
export function analyzeFunctions(code: string): AnalyzedFunction[] {
  const functions: AnalyzedFunction[] = [];
  const lines = code.split('\n');

  // Match function signatures: local function name(args) or function name(args) or name = function(args)
  const funcHeaderRegex = /(?:local\s+)?function\s*([a-zA-Z0-9_.:]+)?\s*\(([^)]*)\)|([a-zA-Z0-9_.]+)\s*=\s*function\s*\(([^)]*)\)/;

  let inFunc = false;
  let currentFunc: Partial<AnalyzedFunction> | null = null;
  let blockDepth = 0;
  let funcIdx = 1;

  for (let i = 0; i < lines.length; i++) {
    const lineStr = lines[i];
    const trimmed = lineStr.trim();

    if (!inFunc) {
      const match = trimmed.match(funcHeaderRegex);
      if (match) {
        inFunc = true;
        blockDepth = 1;
        const name = match[1] || match[3] || `anonymousFunc_${funcIdx}`;
        const rawArgs = match[2] !== undefined ? match[2] : match[4] || '';
        const inputs = rawArgs.split(',').map(s => s.trim()).filter(Boolean);

        currentFunc = {
          id: `fn_${funcIdx++}`,
          name,
          lineStart: i + 1,
          inputs,
          outputs: [],
          localVariables: [],
          calledFunctions: [],
          usedServices: [],
          events: [],
          sideEffects: []
        };
      }
    } else if (currentFunc) {
      // Check block opens/closes within the function
      const openMatches = trimmed.match(/\b(function|then|do|repeat)\b/g);
      const closeMatches = trimmed.match(/\b(end|until)\b/g);
      if (openMatches) blockDepth += openMatches.length;
      if (closeMatches) blockDepth -= closeMatches.length;

      // Check locals
      const localMatch = trimmed.match(/local\s+([a-zA-Z0-9_]+)/);
      if (localMatch && currentFunc.localVariables) {
        currentFunc.localVariables.push(localMatch[1]);
      }

      // Check return
      const returnMatch = trimmed.match(/return\s+(.+)/);
      if (returnMatch && currentFunc.outputs) {
        currentFunc.outputs.push(returnMatch[1]);
      }

      // Check service calls
      for (const service of ROBLOX_SERVICES) {
        if (trimmed.includes(service) && currentFunc.usedServices && !currentFunc.usedServices.includes(service)) {
          currentFunc.usedServices.push(service);
        }
      }

      // Check events
      if (/:(Connect|FireServer|InvokeServer|FireClient|Wait)\b/.test(trimmed)) {
        const evMatch = trimmed.match(/:([A-Za-z]+)\b/);
        if (evMatch && currentFunc.events && !currentFunc.events.includes(evMatch[1])) {
          currentFunc.events.push(evMatch[1]);
        }
      }

      // Check network / side-effects
      if (/(HttpGet|request|HttpPost|writefile|appendfile|FireServer)/.test(trimmed)) {
        if (currentFunc.sideEffects && !currentFunc.sideEffects.includes('Network/I/O Call')) {
          currentFunc.sideEffects.push('Network/I/O Call');
        }
      }

      if (blockDepth <= 0) {
        // Function closed
        currentFunc.lineEnd = i + 1;
        // Inferred purpose & confidence
        let purpose = 'General utility or computational helper.';
        let confidence = 75;

        if (currentFunc.usedServices?.includes('Players') || currentFunc.inputs?.some(inp => inp.toLowerCase().includes('player'))) {
          purpose = 'Processes player entities, avatar properties, or character state.';
          confidence = 88;
        } else if (currentFunc.events?.includes('FireServer') || currentFunc.events?.includes('InvokeServer')) {
          purpose = 'Dispatches network payloads to the game server via RemoteEvent or RemoteFunction.';
          confidence = 92;
        } else if (currentFunc.usedServices?.includes('TweenService')) {
          purpose = 'Creates or manages visual animations and GUI tweening effects.';
          confidence = 89;
        } else if (currentFunc.sideEffects?.length) {
          purpose = 'Performs external I/O or network communications.';
          confidence = 86;
        } else if (currentFunc.outputs?.length && currentFunc.inputs?.length) {
          purpose = 'Transforms input arguments into structured output data.';
          confidence = 82;
        }

        currentFunc.purpose = purpose;
        currentFunc.confidence = confidence;
        functions.push(currentFunc as AnalyzedFunction);

        inFunc = false;
        currentFunc = null;
        blockDepth = 0;
      }
    }
  }

  return functions;
}

/**
 * STAGE 6 — CONTROL FLOW ANALYSIS
 * Detects state-machine dispatchers, obfuscation control-flow flattening, pcall wrapping
 */
export function analyzeControlFlow(code: string): ControlFlowPattern[] {
  const patterns: ControlFlowPattern[] = [];

  // 1. State machine dispatcher loop (typical of IronBrew, Luraph, Moonsec)
  if (/while\s+true\s+do\s+if\s+[a-zA-Z0-9_]+\s*==\s*[0-9]+/.test(code) ||
      /while\s+true\s+do\s+local\s+[a-zA-Z0-9_]+\s*=\s*[a-zA-Z0-9_]+\[[a-zA-Z0-9_]+\]/.test(code)) {
    patterns.push({
      type: 'state_machine_dispatcher',
      description: 'Control-flow flattening detected: VM dispatch loop with state index.',
      severity: 'high'
    });
  }

  // 2. High nesting of conditions (>= 4 levels)
  const lines = code.split('\n');
  let currentIfDepth = 0;
  let maxIfDepth = 0;
  for (const line of lines) {
    if (/\bif\b.*\bthen\b/.test(line)) currentIfDepth++;
    if (/\bend\b/.test(line) && currentIfDepth > 0) currentIfDepth--;
    if (currentIfDepth > maxIfDepth) maxIfDepth = currentIfDepth;
  }
  if (maxIfDepth >= 4) {
    patterns.push({
      type: 'nested_conditions',
      description: `Excessive nested conditionals (${maxIfDepth} levels) designed to obscure branching logic.`,
      severity: 'medium'
    });
  }

  // 3. Pcall wrappers
  const pcallCount = (code.match(/\b(pcall|xpcall)\s*\(/g) || []).length;
  if (pcallCount >= 3) {
    patterns.push({
      type: 'pcall_wrapper',
      description: `Multiple protected calls (${pcallCount} instances) used for error suppression or anti-tamper.`,
      severity: 'low'
    });
  }

  return patterns;
}

/**
 * STAGE 7 — ROBLOX / LUAU API ANALYSIS
 * Identifies services, remotes, instance creation, and Luau features without execution
 */
export function analyzeRobloxApis(code: string): RobloxApiUsage[] {
  const apis: RobloxApiUsage[] = [];
  const seen = new Set<string>();

  // Services
  const serviceRegex = /game\s*:\s*GetService\s*\(\s*["']([a-zA-Z0-9_]+)["']\s*\)/g;
  let match: RegExpExecArray | null;
  while ((match = serviceRegex.exec(code)) !== null) {
    const name = match[1];
    const key = `service_${name}`;
    if (!seen.has(key)) {
      seen.add(key);
      apis.push({
        category: 'Service',
        name,
        detectedUsage: `Roblox ${name} Service`
      });
    }
  }

  // Instance.new
  const instRegex = /Instance\.new\s*\(\s*["']([a-zA-Z0-9_]+)["']\s*\)/g;
  while ((match = instRegex.exec(code)) !== null) {
    const name = match[1];
    const key = `instance_${name}`;
    if (!seen.has(key)) {
      seen.add(key);
      apis.push({
        category: 'Instance',
        name,
        detectedUsage: `Instantiation of ${name}`
      });
    }
  }

  // Remotes
  if (/\b(RemoteEvent|RemoteFunction|BindableEvent|BindableFunction)\b/.test(code)) {
    apis.push({
      category: 'Remote',
      name: 'Client-Server Remote',
      detectedUsage: 'Inter-process remote communication mechanism'
    });
  }

  // Task library
  if (/\btask\.(wait|spawn|defer|delay|cancel)\b/.test(code)) {
    apis.push({
      category: 'Task',
      name: 'task',
      detectedUsage: 'Modern Luau task scheduler library'
    });
  }

  return apis;
}

/**
 * SECURITY ANALYSIS
 * Identifies suspicious constructs without executing them
 */
export function scanSecurityWarnings(code: string): SecurityWarning[] {
  const warnings: SecurityWarning[] = [];
  let warningId = 1;

  // 1. Dynamic Code Loading
  if (/\b(loadstring|load|getfenv|setfenv)\s*\(/.test(code)) {
    warnings.push({
      id: `sec_${warningId++}`,
      type: 'DYNAMIC_CODE_LOADING',
      title: 'Dynamic Code Execution',
      description: 'The script uses loadstring or environment access functions to evaluate arbitrary code at runtime.',
      severity: 'critical',
      sample: (code.match(/\b(loadstring|getfenv|setfenv)\s*\([^)]*\)/) || [])[0]
    });
  }

  // 2. Network Access (HttpGet, request, syn.request, http_request)
  if (/\b(HttpGet|HttpPost|syn\.request|http_request|request)\b/.test(code)) {
    warnings.push({
      id: `sec_${warningId++}`,
      type: 'NETWORK_ACCESS',
      title: 'External Network Request',
      description: 'The script initiates external HTTP requests, which may download secondary payloads or exfiltrate game data.',
      severity: 'high',
      sample: (code.match(/\b(HttpGet|syn\.request|http_request|request)\s*\([^)]*\)/) || [])[0]
    });
  }

  // 3. Webhook Detection (Discord webhooks)
  if (/https?:\/\/(canary\.)?discord(app)?\.com\/api\/webhooks\//.test(code)) {
    warnings.push({
      id: `sec_${warningId++}`,
      type: 'WEBHOOK_DETECTION',
      title: 'Discord Webhook URL Detected',
      description: 'Potential data logging or credential exfiltration webhook endpoint discovered.',
      severity: 'critical'
    });
  }

  // 4. Obfuscated URLs
  if (/string\.char\(.*\)\s*\.\.\s*string\.char\(.*\)/.test(code) && /http/.test(code)) {
    warnings.push({
      id: `sec_${warningId++}`,
      type: 'OBFUSCATED_URL',
      title: 'Obfuscated Network Target',
      description: 'URL target reconstructed from fragmented character arrays to hide the destination endpoint.',
      severity: 'high'
    });
  }

  // 5. Extreme Code Complexity
  const entropyMatch = code.match(/(\\[0-9]{2,3}|\\x[0-9a-fA-F]{2}){10,}/);
  if (entropyMatch) {
    warnings.push({
      id: `sec_${warningId++}`,
      type: 'EXTREME_CODE_COMPLEXITY',
      title: 'Dense Byte/Hex Packing',
      description: 'Script contains large continuous sequences of packed byte or hexadecimal escape tokens.',
      severity: 'medium'
    });
  }

  return warnings;
}

/**
 * OUTPUT VALIDATION ENGINE
 * Checks syntax structure, unclosed blocks, missing ends
 */
export function validateLuaSyntax(code: string): { isValid: boolean; issues: ValidationIssue[] } {
  const issues: ValidationIssue[] = [];
  const lines = code.split('\n');

  let blockDepth = 0;
  let parenDepth = 0;
  let bracketDepth = 0;
  let braceDepth = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // Strip comments
    const noComment = line.replace(/--.*$/, '');

    // Block openers
    const openers = noComment.match(/\b(function|then|do|repeat)\b/g);
    const closers = noComment.match(/\b(end|until)\b/g);

    if (openers) blockDepth += openers.length;
    if (closers) blockDepth -= closers.length;

    // Check bracket balance
    for (const ch of noComment) {
      if (ch === '(') parenDepth++;
      else if (ch === ')') parenDepth--;
      else if (ch === '[') bracketDepth++;
      else if (ch === ']') bracketDepth--;
      else if (ch === '{') braceDepth++;
      else if (ch === '}') braceDepth--;
    }

    if (parenDepth < 0) {
      issues.push({ type: 'error', message: 'Unmatched closing parenthesis ")"', line: i + 1 });
      parenDepth = 0;
    }
    if (bracketDepth < 0) {
      issues.push({ type: 'error', message: 'Unmatched closing bracket "]"', line: i + 1 });
      bracketDepth = 0;
    }
    if (braceDepth < 0) {
      issues.push({ type: 'error', message: 'Unmatched closing brace "}"', line: i + 1 });
      braceDepth = 0;
    }
  }

  if (blockDepth !== 0) {
    issues.push({
      type: 'warning',
      message: blockDepth > 0
        ? `Potential unclosed block (missing ${blockDepth} "end" or "until" statement)`
        : `Unexpected extra "end" statements (${Math.abs(blockDepth)} extra)`
    });
  }

  if (parenDepth > 0) issues.push({ type: 'warning', message: `Unclosed parenthesis (depth: ${parenDepth})` });
  if (bracketDepth > 0) issues.push({ type: 'warning', message: `Unclosed bracket (depth: ${bracketDepth})` });
  if (braceDepth > 0) issues.push({ type: 'warning', message: `Unclosed brace (depth: ${braceDepth})` });

  return {
    isValid: issues.filter(iss => iss.type === 'error').length === 0,
    issues
  };
}

/**
 * STATIC CODE SIMPLIFIER
 * Safely replaces deterministically decoded strings, constants, and confident identifiers
 */
export function generateStaticallySimplifiedCode(
  code: string,
  decodedStrings: DecodedString[],
  constants: ConstantFolding[],
  identifiers: InferredIdentifier[]
): string {
  let modified = code;

  // 1. Replace decoded strings (longest original first)
  const sortedStrings = [...decodedStrings].sort((a, b) => b.original.length - a.original.length);
  for (const s of sortedStrings) {
    if (s.original.length > 3) {
      modified = modified.split(s.original).join(s.decoded);
    }
  }

  // 2. Replace constant foldings
  const sortedConsts = [...constants].sort((a, b) => b.original.length - a.original.length);
  for (const c of sortedConsts) {
    // Only replace if safely separated or exact
    const escaped = c.original.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(?<=[^a-zA-Z0-9_]|^)${escaped}(?=[^a-zA-Z0-9_]|$)`, 'g');
    modified = modified.replace(regex, c.simplified);
  }

  // 3. Rename highly confident identifiers (>= 90%)
  const confidentIds = identifiers.filter(id => id.confidence >= 90);
  for (const id of confidentIds) {
    const escaped = id.original.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\b${escaped}\\b`, 'g');
    modified = modified.replace(regex, id.inferred);
  }

  return modified;
}

/**
 * MASTER STATIC ANALYSIS PIPELINE
 */
export function runStaticPipeline(code: string): StaticAnalysisResult {
  const language = detectLanguage(code);
  const lines = code.split('\n');
  const lineCount = lines.length;
  const charCount = code.length;

  // Stage 1: Lexical
  const tokens = tokenizeLua(code);
  const tokenCount = tokens.length;

  // Stage 2: String
  const decodedStrings = analyzeAndDecodeStrings(code);

  // Stage 3: Constants
  const constantFoldings = analyzeConstants(code);

  // Stage 4: Identifiers
  const inferredIdentifiers = analyzeIdentifiers(code, tokens);

  // Stage 5: Functions
  const functions = analyzeFunctions(code);

  // Stage 6: Control Flow
  const controlFlowPatterns = analyzeControlFlow(code);

  // Stage 7: Roblox/Luau
  const robloxApis = analyzeRobloxApis(code);

  // Security
  const securityWarnings = scanSecurityWarnings(code);

  // Syntax Validation
  const validation = validateLuaSyntax(code);

  // Statically simplified code
  const staticallySimplifiedCode = generateStaticallySimplifiedCode(
    code,
    decodedStrings,
    constantFoldings,
    inferredIdentifiers
  );

  // Obfuscation indicators
  const obfuscationIndicators = [
    {
      name: 'Encoded strings',
      detected: decodedStrings.length > 0,
      detail: `${decodedStrings.length} encoded or escaped strings detected`
    },
    {
      name: 'Renamed / Obfuscated Identifiers',
      detected: inferredIdentifiers.length > 0,
      detail: `${inferredIdentifiers.length} obfuscated identifiers analyzed with inferred names`
    },
    {
      name: 'Complex Control Flow',
      detected: controlFlowPatterns.length > 0,
      detail: controlFlowPatterns.map(p => p.description).join('; ') || 'Normal control flow'
    },
    {
      name: 'Dynamic Code Construction',
      detected: securityWarnings.some(w => w.type === 'DYNAMIC_CODE_LOADING'),
      detail: 'Dynamic evaluation or env manipulation detected'
    },
    {
      name: 'Hex / Packed Constants',
      detected: constantFoldings.length > 0,
      detail: `${constantFoldings.length} folded constants identified`
    }
  ];

  // Overall confidence calculation
  let confidence = 85;
  if (decodedStrings.length > 10) confidence -= 5;
  if (controlFlowPatterns.some(p => p.severity === 'high')) confidence -= 10;
  if (securityWarnings.some(w => w.severity === 'critical')) confidence -= 5;
  if (functions.length > 0) confidence += 4;
  if (confidence > 98) confidence = 98;
  if (confidence < 45) confidence = 45;

  return {
    language,
    lineCount,
    charCount,
    tokenCount,
    tokens,
    decodedStrings,
    constantFoldings,
    inferredIdentifiers,
    functions,
    controlFlowPatterns,
    robloxApis,
    securityWarnings,
    obfuscationIndicators,
    overallConfidence: confidence,
    staticallySimplifiedCode,
    validation
  };
}

/**
 * Large Script Chunking along function boundaries
 */
export function chunkScript(code: string, maxChunkLines = 200): string[] {
  const lines = code.split('\n');
  if (lines.length <= maxChunkLines) return [code];

  const chunks: string[] = [];
  let currentChunk: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    currentChunk.push(line);

    // If chunk reached size and we hit an "end" statement or empty line, split
    if (currentChunk.length >= maxChunkLines) {
      if (/^\s*end\b/.test(line) || /^\s*$/.test(line) || i === lines.length - 1) {
        chunks.push(currentChunk.join('\n'));
        currentChunk = [];
      }
    }
  }

  if (currentChunk.length > 0) {
    chunks.push(currentChunk.join('\n'));
  }

  return chunks;
}
