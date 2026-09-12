export interface SampleScript {
  id: string;
  name: string;
  description: string;
  language: 'Lua' | 'Luau';
  code: string;
}

export const SAMPLE_SCRIPTS: SampleScript[] = [
  {
    id: 'roblox_remote_obfuscated',
    name: 'Roblox Remote Client (Obfuscated)',
    description: 'Uses hex strings, meaningless variables, and Roblox RemoteEvent dispatch',
    language: 'Luau',
    code: `-- Example: Obfuscated Roblox Client Dispatcher
local _0x1a = game:GetService("Players")
local _0x2b = _0x1a.LocalPlayer
local _0x3c = game:GetService("ReplicatedStorage")
local _0x4d = workspace.CurrentCamera

local v17 = _0x3c:WaitForChild("NetworkDispatcher")
local a = "\\x68\\x65\\x61\\x6c\\x74\\x68"
local b = "\\x70\\x6f\\x73\\x69\\x74\\x69\\x6f\\x6e"

local function _fn12(p1, p2)
    local x1 = p1.Character
    if x1 and x1:FindFirstChild("Humanoid") then
        local L0 = x1.Humanoid
        L0.WalkSpeed = 16 + 8 * 2
        v17:FireServer(a, L0.Health)
        return true
    end
    return false
end

_fn12(_0x2b, nil)
`
  },
  {
    id: 'byte_encoded_strings',
    name: 'Byte & Char Obfuscation',
    description: 'Encodes URLs and secrets via string.char, string.reverse, and constant arithmetic',
    language: 'Lua',
    code: `-- Example: Byte-Encoded String Construction
local targetHost = string.char(104, 116, 116, 112, 115, 58, 47, 47) .. "api.example.com"
local endpoint = string.reverse("atad/teg/")
local authKey = "\\107\\101\\121\\95\\115\\101\\99\\114\\101\\116"

local val1 = 5 * 20 + 3
local val2 = 0x10 + 0x20

local function sendPayload(data)
    local fullUrl = targetHost .. endpoint
    -- Network dispatch
    if HttpGet then
        return HttpGet(fullUrl)
    end
    return nil
end

sendPayload(authKey)
`
  },
  {
    id: 'control_flow_dispatcher',
    name: 'Control Flow Flattening',
    description: 'IronBrew/Luraph style state-machine dispatcher loop with pcall wrappers',
    language: 'Lua',
    code: `-- Example: State-Machine Dispatcher Loop
local state = 1
local accumulator = 0

while true do
    if state == 1 then
        accumulator = accumulator + 10
        state = 3
    elseif state == 2 then
        accumulator = accumulator * 2
        break
    elseif state == 3 then
        pcall(function()
            accumulator = accumulator + 5
        end)
        state = 2
    else
        break
    end
end

print("Result:", accumulator)
`
  },
  {
    id: 'luau_typed_module',
    name: 'Modern Luau Typed Module',
    description: 'Demonstrates modern Luau types, compound assignments, task library',
    language: 'Luau',
    code: `-- Example: Modern Luau Typed Service
export type PlayerStats = {
    level: number,
    experience: number,
    coins: number
}

local Players = game:GetService("Players")
local localPlayer = Players.LocalPlayer

local function awardBonus(stats: PlayerStats, multiplier: number): PlayerStats
    stats.experience += 100 * multiplier
    stats.coins += 50
    task.wait(0.5)
    return stats
end

return awardBonus
`
  }
];
