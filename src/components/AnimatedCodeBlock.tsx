import React, { useState, useEffect } from "react";

interface AnimatedCodeBlockProps {
  code: string[];
  language?: string;
  animationDelay?: number;
}

export function AnimatedCodeBlock({
  code,
  language = "solidity",
  animationDelay = 0,
}: AnimatedCodeBlockProps) {
  const [displayedLines, setDisplayedLines] = useState<number>(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      const interval = setInterval(() => {
        setDisplayedLines((prev) => {
          if (prev < code?.length) {
            return prev + 1;
          }
          clearInterval(interval);
          return prev;
        });
      }, 100);

      return () => clearInterval(interval);
    }, animationDelay);

    return () => clearTimeout(timer);
  }, [code?.length, animationDelay]);

  return (
    <div className="border-2 border-[#00FFFF] bg-[#0a0e27]/80 p-6 font-mono-code overflow-hidden">
      <div className="flex items-center gap-2 mb-4 pb-4 border-b border-[#00FFFF]/30">
        <div className="w-3 h-3 rounded-full bg-[#FF00FF]" />
        <div className="w-3 h-3 rounded-full bg-[#00FF41]" />
        <div className="w-3 h-3 rounded-full bg-[#00FFFF]" />
        <span className="text-[#00FFFF] text-xs ml-auto">{language}</span>
      </div>

      <div className="space-y-1">
        {code?.slice(0, displayedLines).map((line, idx) => (
          <div
            key={idx}
            className="animate-float-up text-sm leading-relaxed"
            style={{
              animationDelay: `${idx * 50}ms`,
            }}
          >
            <span className="text-gray-500 mr-4 inline-block w-6 text-right">{idx + 1}</span>
            <CodeLine content={line} />
          </div>
        ))}
        {displayedLines < code?.length && (
          <div className="text-[#00FF41] animate-pulse">
            <span className="text-gray-500 mr-4 inline-block w-6 text-right">
              {displayedLines + 1}
            </span>
            <span className="inline-block w-2 h-4 bg-[#00FF41] animate-pulse" />
          </div>
        )}
      </div>
    </div>
  );
}

function CodeLine({ content }: { content: string }) {
  // Simple syntax highlighting for common patterns
  const parts = content.split(
    /(\b(?:function|contract|uint256|address|return|if|for|while|require|emit|event|mapping|public|private|view|pure|external|internal|constant|immutable|payable|modifier|constructor|import|pragma|solidity|from|to|amount|balance|transfer|approve|allowance|totalSupply|name|symbol|decimals)\b|[{}();,=<>!&|+\-*/%]|"[^"]*"|'[^']*'|\/\/.*)/g
  );

  return (
    <>
      {parts.map((part, idx) => {
        if (!part) return null;

        // Keywords
        if (/^(function|contract|uint256|address|return|if|for|while|require|emit|event|mapping|public|private|view|pure|external|internal|constant|immutable|payable|modifier|constructor|import|pragma|solidity)$/.test(part)) {
          return (
            <span key={idx} className="text-[#FF00FF]">
              {part}
            </span>
          );
        }

        // Strings
        if (/^["'].*["']$/.test(part)) {
          return (
            <span key={idx} className="text-[#00FF41]">
              {part}
            </span>
          );
        }

        // Comments
        if (part.startsWith("//")) {
          return (
            <span key={idx} className="text-gray-500">
              {part}
            </span>
          );
        }

        // Operators and punctuation
        if (/^[{}();,=<>!&|+\-*/%]$/.test(part)) {
          return (
            <span key={idx} className="text-[#00FFFF]">
              {part}
            </span>
          );
        }

        // Default text
        return <span key={idx}>{part}</span>;
      })}
    </>
  );
}

// Pre-built code examples
export const CodeExamples = {
  crossChainTransfer: [
    "// ChainSync Cross-Chain Transfer",
    "contract CrossChainBridge {",
    "  function transferAsset(",
    "    address token,",
    "    uint256 amount,",
    "    uint256 destinationChain",
    "  ) external payable {",
    "    require(amount > 0, 'Amount must be > 0');",
    "    ",
    "    // Lock asset on source chain",
    "    IERC20(token).transferFrom(msg.sender, address(this), amount);",
    "    ",
    "    // Generate cryptographic proof",
    "    bytes32 proof = generateStateProof(token, amount);",
    "    ",
    "    // Emit cross-chain event",
    "    emit AssetLocked(msg.sender, token, amount, destinationChain, proof);",
    "  }",
    "}",
  ],
  tokenomics: [
    "// OMB Token Distribution",
    "contract TokenomicsModel {",
    "  uint256 constant STAKING_REWARDS = 40;",
    "  uint256 constant TEAM_ADVISORS = 15;",
    "  uint256 constant INVESTORS = 20;",
    "  uint256 constant ECOSYSTEM = 20;",
    "  uint256 constant LIQUIDITY = 5;",
    "  ",
    "  mapping(address => uint256) public balances;",
    "  ",
    "  function stake(uint256 amount) external {",
    "    require(amount > 0, 'Stake amount required');",
    "    balances[msg.sender] += amount;",
    "    emit Staked(msg.sender, amount);",
    "  }",
    "}",
  ],
  validation: [
    "// State Proof Validation",
    "function validateProof(",
    "  bytes32 proof,",
    "  bytes calldata stateData",
    ") internal view returns (bool) {",
    "  // Verify cryptographic signature",
    "  bool isValid = verifyCrypto(proof, stateData);",
    "  ",
    "  // Check consensus threshold",
    "  require(consensusCount >= MIN_VALIDATORS, 'Insufficient consensus');",
    "  ",
    "  return isValid;",
    "}",
  ],
};
