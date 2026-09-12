export type AnalysisMode =
  | 'AUTO'
  | 'DEEP'
  | 'RECONSTRUCTION'
  | 'EXPLAIN'
  | 'TRANSLATE'
  | 'SECURITY';

export type DetectedLanguage = 'Lua' | 'Luau' | 'Unknown';

export interface TokenInfo {
  type: 'keyword' | 'identifier' | 'string' | 'number' | 'operator' | 'comment' | 'symbol' | 'whitespace';
  value: string;
  line: number;
  col: number;
}

export interface DecodedString {
  original: string;
  decoded: string;
  type: 'hex_escape' | 'decimal_escape' | 'string_char' | 'concatenation' | 'byte_array' | 'reversed' | 'base64';
  line?: number;
}

export interface ConstantFolding {
  original: string;
  simplified: string;
  type: 'arithmetic' | 'concatenation' | 'type_conversion' | 'hex_number';
  line?: number;
}

export interface InferredIdentifier {
  original: string;
  inferred: string;
  reason: string;
  confidence: number; // 0 to 100
  occurrences: number;
}

export interface AnalyzedFunction {
  id: string;
  name: string;
  lineStart: number;
  lineEnd: number;
  inputs: string[];
  outputs: string[];
  localVariables: string[];
  calledFunctions: string[];
  usedServices: string[];
  events: string[];
  sideEffects: string[];
  purpose: string;
  confidence: number;
}

export interface ControlFlowPattern {
  type: 'state_machine_dispatcher' | 'nested_conditions' | 'opaque_predicates' | 'pcall_wrapper' | 'loop_unrolling';
  description: string;
  severity: 'low' | 'medium' | 'high';
  line?: number;
}

export interface RobloxApiUsage {
  category: 'Service' | 'Instance' | 'Remote' | 'Task' | 'Event';
  name: string;
  detectedUsage: string;
  line?: number;
}

export interface SecurityWarning {
  id: string;
  type:
    | 'NETWORK_ACCESS'
    | 'DYNAMIC_CODE_LOADING'
    | 'OBFUSCATED_URL'
    | 'UNUSUAL_REMOTE_CALL'
    | 'EXTREME_CODE_COMPLEXITY'
    | 'DYNAMIC_FUNCTION_CONSTRUCTION'
    | 'ENVIRONMENT_MANIPULATION'
    | 'WEBHOOK_DETECTION';
  title: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  line?: number;
  sample?: string;
}

export interface ValidationIssue {
  type: 'error' | 'warning';
  message: string;
  line?: number;
}

export interface StaticAnalysisResult {
  language: DetectedLanguage;
  lineCount: number;
  charCount: number;
  tokenCount: number;
  tokens: TokenInfo[];
  decodedStrings: DecodedString[];
  constantFoldings: ConstantFolding[];
  inferredIdentifiers: InferredIdentifier[];
  functions: AnalyzedFunction[];
  controlFlowPatterns: ControlFlowPattern[];
  robloxApis: RobloxApiUsage[];
  securityWarnings: SecurityWarning[];
  obfuscationIndicators: {
    name: string;
    detected: boolean;
    detail: string;
  }[];
  overallConfidence: number;
  staticallySimplifiedCode: string;
  validation: {
    isValid: boolean;
    issues: ValidationIssue[];
  };
}

export interface AnalysisResponse {
  mode: AnalysisMode;
  cleanCode: string;
  explanation: string;
  summary: {
    language: DetectedLanguage;
    lines: number;
    functionsCount: number;
    variablesCount: number;
    overallConfidence: number;
    indicators: string[];
  };
  securityWarnings: SecurityWarning[];
  validation: {
    isValid: boolean;
    issues: ValidationIssue[];
  };
  staticAnalysis?: StaticAnalysisResult;
}

export interface HistoryItem {
  id: string;
  name: string;
  timestamp: number;
  sourceUrl?: string;
  language: DetectedLanguage;
  lineCount: number;
  analysisScore: number;
  inputCode: string;
  outputCode: string;
  explanation?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: number;
}

export interface AppSettings {
  autoFormat: boolean;
  showConfidence: boolean;
  showSecurityWarnings: boolean;
  autoConvertGithubUrl: boolean;
  autoRscriptsUrlDetect: boolean;
  maxAnalysisChars: number;
  defaultMode: AnalysisMode;
}
