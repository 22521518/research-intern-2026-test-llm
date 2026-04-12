PROMPT = r"""
You are a smart contract security expert. 
Given a Solidity smart contract, analyze it and identify vulnerabilities.

Contract:
{CONTRACT_CODE}

Requirements:
1. Classify ALL vulnerabilities in the contract.
   - For each vulnerability, classify its type using ONLY {VULNERABILITY_LIST}.
   - If it matches none, return "Other".
2. If no vulnerability exists, return "Normal".
3. Identify vulnerable line(s) as line number or range (e.g., 45 or 45–48); use "N/A" if Normal.
4. For EACH vulnerability, provide structured reasoning consisting of: Execution & Causality
*Execution (critical steps only):
- Trigger: operation introducing the vulnerability
- State Issue: unsafe or incorrect state handling
- Exploitable Behavior: how execution flow allows attacker interaction
*Causality:
- State: relevant state conditions required for exploitation
- Guard: conditions allowing execution (e.g., require, if)
- Transition: the incorrect execution order or logic flaw
- Capability: what the attacker can do to exploit the vulnerability
- Outcome: the result of the exploit
---------------------
IMPORTANT RULES:
- Be concise but precise (no unnecessary steps)
- Only include vulnerability-critical information
- Do NOT describe the entire function flow
- Each field must be explicitly stated
- Avoid vague statements (e.g., "this can be exploited")
---------------------
Output ONLY a valid JSON object:
{{
  "vulnerabilities": [
    {{
      "vulnerability_type": "<type>",
      "evidence": ["<line number or range>"],
    }}
  ]
}}
"""