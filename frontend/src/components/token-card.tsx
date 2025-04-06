"use client";

import { Tag, User } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { formatEther } from "viem";
import { useAccount } from "wagmi";

interface Token {
  id: string;
  description: string;
  imageUri: string;
  price: bigint;
  owner: string;
}

interface TokenCardProps {
  token: Token;
  viewMode: "grid" | "list";
}

export default function TokenCard({ token, viewMode }: TokenCardProps) {
  const formattedPrice = formatEther(token.price);
  const { address } = useAccount();
  const isOwner = address?.toLowerCase() === token.owner.toLowerCase();

  const tokenImage = token.imageUri || "/placeholder.svg?height=300&width=300";
  const tokenAlt = token.description || `Token #${token.id}`;
  const ownerShort = `${token.owner.slice(0, 6)}...${token.owner.slice(-4)}`;

  if (viewMode === "grid") {
    return (
      <Card className="overflow-hidden border border-zinc-800 bg-zinc-900/80 backdrop-blur-sm hover:shadow-lg transition-all duration-300 hover:border-zinc-700">
        <div className="relative aspect-square">
          <Image
            src={tokenImage}
            alt={tokenAlt}
            fill
            className="object-cover"
          />
        </div>
        <CardContent className="p-4">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-semibold text-lg truncate text-zinc-100">
              {token.description}
            </h3>
            <span className="font-bold text-emerald-400">
              {formattedPrice} ETH
            </span>
          </div>
          <div className="flex items-center text-xs text-zinc-400 gap-2 mt-2">
            <User className="h-3 w-3" />
            <span className="truncate">
              Owner: {ownerShort}
              {isOwner && " (You)"}
            </span>
          </div>
        </CardContent>
        <CardFooter className="p-4 pt-0">
          {isOwner ? (
            <div className="w-full text-center text-sm text-zinc-400 py-2">
              You own this token
            </div>
          ) : (
            <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">
              Buy Now
            </Button>
          )}
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden border border-zinc-800 bg-zinc-900/80 backdrop-blur-sm hover:shadow-lg transition-all duration-300 hover:border-zinc-700">
      <div className="flex flex-col md:flex-row">
        <div className="relative w-full md:w-48 h-48">
          <Image
            src={tokenImage}
            alt={tokenAlt}
            fill
            className="object-cover"
          />
        </div>
        <div className="flex-1 p-4">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-semibold text-lg text-zinc-100">
              {token.description}
            </h3>
            <span className="font-bold text-emerald-400">
              {formattedPrice} ETH
            </span>
          </div>
          <div className="grid grid-cols-1 gap-2 mb-4 mt-4">
            <div className="flex items-center text-xs text-zinc-400 gap-2">
              <User className="h-3 w-3" />
              <span>
                Owner: {ownerShort}
                {isOwner && " (You)"}
              </span>
            </div>
            <div className="flex items-center text-xs text-zinc-400 gap-2">
              <Tag className="h-3 w-3" />
              <span>Token ID: {token.id}</span>
            </div>
          </div>
          {isOwner ? (
            <div className="text-sm text-zinc-400 py-2">You own this token</div>
          ) : (
            <Button className="w-full md:w-auto bg-emerald-600 hover:bg-emerald-700 text-white">
              Buy Now
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
