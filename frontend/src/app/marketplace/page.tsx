"use client";

import { useState, useEffect } from "react";
import {
  useConnect,
  useDisconnect,
  useAccount,
  useReadContract,
  useReadContracts,
} from "wagmi";
import { readContract } from "wagmi/actions";
import { config } from "@/lib/config";

import { Search, Grid, List, Wallet } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import TokenCard from "@/components/token-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { contractABI } from "@/lib/abi";
import { type BaseError } from "wagmi";
import { Abi } from "viem";
interface ContractToken {
  description: string;
  imageUri: string;
  price: bigint;
  owner: string;
}

interface Token {
  id: string;
  description: string;
  imageUri: string;
  price: bigint;
  owner: string;
}

const CONTRACT_ADDRESS = "0x0Af39c275ed7698F6e5b4C676F3396db88Db5ED9";

export default function MarketplacePage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [tokens, setTokens] = useState<Token[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const metaMaskConnector = connectors.find(
    (connector) =>
      connector.name.toLowerCase() === "metamask" || connector.id === "injected"
  );

  const { data: tokenIds, isSuccess: tokenIdsSuccess } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: contractABI,
    functionName: "getTokensByOwner",
    args: [address],
    query: {
      enabled: isConnected && !!address,
    },
  });
  useEffect(() => {
    if (
      !tokenIdsSuccess ||
      !tokenIds ||
      !Array.isArray(tokenIds) ||
      tokenIds.length === 0
    ) {
      return;
    }

    setIsLoading(true);
    const fetchTokens = async () => {
      try {
        const fetchedTokens: Token[] = [];

        for (const tokenId of tokenIds as bigint[]) {
          try {
            const tokenData = (await readContract(config, {
              address: CONTRACT_ADDRESS,
              abi: contractABI,
              functionName: "getTokenById",
              args: [tokenId],
            })) as ContractToken;

            let imageUrl =
              tokenData.imageUri || `/placeholder.svg?height=300&width=300`;

            if (imageUrl.startsWith("ipfs://")) {
              imageUrl = `https://ipfs.io/ipfs/${imageUrl.substring(7)}`;
            }

            fetchedTokens.push({
              id: tokenId.toString(),
              description:
                tokenData.description || `Token #${tokenId.toString()}`,
              imageUri: imageUrl,
              price: tokenData.price || BigInt(0),
              owner:
                tokenData.owner ||
                address ||
                "0x0000000000000000000000000000000000000000",
            });
          } catch (err) {
            console.error(`Error fetching token ${tokenId}:`, err);
          }
        }

        setTokens(fetchedTokens);
      } catch (error) {
        console.error("Error fetching token details:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTokens();
  }, [tokenIds, tokenIdsSuccess, address]);

  const filteredTokens = tokens.filter((token) =>
    token.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 relative overflow-hidden">
      <div className="absolute w-full h-full bg-gradient-to-br from-blue-950/20 to-purple-950/20 opacity-30"></div>
      <div className="relative z-10">
        <header className="border-b border-zinc-800/40 backdrop-blur-sm bg-zinc-900/60">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Wallet className="h-6 w-6 text-emerald-400" />
              <h1 className="text-xl font-bold text-white">
                ChillToken Marketplace
              </h1>
            </div>
            <div>
              {isConnected ? (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-zinc-400 hidden md:inline">
                    {address?.slice(0, 6)}...{address?.slice(-4)}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => disconnect()}
                    className="border-zinc-700 text-zinc-200  bg-black/30"
                  >
                    Disconnect
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={() => {
                    // Use only MetaMask connector
                    if (metaMaskConnector) {
                      connect({ connector: metaMaskConnector });
                    } else {
                      console.error("MetaMask connector not found");
                      alert("Please install MetaMask to connect");
                    }
                  }}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  Connect with MetaMask
                </Button>
              )}
            </div>
          </div>
        </header>
        <main className="container mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4"
          >
            <div className="flex items-center flex-1 max-w-2xl w-full">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 h-4 w-4" />
                <Input
                  placeholder="Search by description"
                  className="pl-10 border-zinc-700 bg-zinc-900 text-zinc-200 w-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`p-2 rounded-lg ${
                  viewMode === "grid"
                    ? "bg-emerald-600 text-white"
                    : "bg-zinc-800 hover:bg-zinc-700 text-zinc-200"
                }`}
                onClick={() => setViewMode("grid")}
              >
                <Grid className="h-5 w-5" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`p-2 rounded-lg ${
                  viewMode === "list"
                    ? "bg-emerald-600 text-white"
                    : "bg-zinc-800 hover:bg-zinc-700 text-zinc-200"
                }`}
                onClick={() => setViewMode("list")}
              >
                <List className="h-5 w-5" />
              </motion.button>
            </div>
          </motion.div>

          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
            </div>
          ) : (
            <AnimatePresence>
              <motion.div
                key={viewMode}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className={`grid ${
                  viewMode === "grid"
                    ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
                    : "grid-cols-1"
                } gap-6`}
              >
                {filteredTokens.length === 0 ? (
                  <div className="col-span-full text-center py-12 text-zinc-400">
                    {isConnected
                      ? "No tokens found matching your criteria"
                      : "Connect your wallet to view your tokens"}
                  </div>
                ) : (
                  filteredTokens.map((token, index) => (
                    <motion.div
                      key={token.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <TokenCard token={token} viewMode={viewMode} />
                    </motion.div>
                  ))
                )}
              </motion.div>
            </AnimatePresence>
          )}
        </main>
      </div>
    </div>
  );
}
