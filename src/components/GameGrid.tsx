
import { GameCard } from "./GameCard";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Search, Filter } from "lucide-react";

// Mock games data
const gamesData = [
  {
    id: "4",
    title: "Elden Ring",
    image: "https://images.unsplash.com/photo-1527346842894-892dcef7fc72?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
    price: 59.99,
    genre: "Action RPG",
    rating: 5,
    description: "Elden Ring is an action RPG which takes place in the Lands Between, sometime after the Shattering of the titular Elden Ring.",
  },
  {
    id: "5",
    title: "Horizon Forbidden West",
    image: "https://images.unsplash.com/photo-1605899435973-ca2d1a8431cf?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
    price: 69.99,
    genre: "Action RPG",
    rating: 4,
    description: "Join Aloy as she braves the Forbidden West – a majestic but dangerous frontier that conceals mysterious new threats.",
  },
  {
    id: "6",
    title: "Apex Legends",
    image: "https://images.unsplash.com/photo-1560253023-3ec5085709ee?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
    price: "Free" as const,
    genre: "Battle Royale",
    rating: 4,
    description: "Apex Legends is a free-to-play battle royale game where legendary characters with powerful abilities team up to battle for fame and fortune.",
  },
  {
    id: "7",
    title: "God of War Ragnarök",
    image: "https://images.unsplash.com/photo-1580327344181-c1163234e5a0?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
    price: 59.99,
    genre: "Action Adventure",
    rating: 5,
    description: "From Santa Monica Studio comes the sequel to the critically acclaimed God of War (2018). Kratos and Atreus must journey to each of the Nine Realms in search of answers.",
  },
  {
    id: "8",
    title: "Valorant",
    image: "https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
    price: "Free" as const,
    genre: "Tactical Shooter",
    rating: 4,
    description: "Valorant is a free-to-play 5v5 character-based tactical shooter. More than guns and bullets, you'll choose an Agent armed with adaptive, swift, and lethal abilities.",
  },
  {
    id: "9",
    title: "Spider-Man Miles Morales",
    image: "https://images.unsplash.com/photo-1497124401559-3e75ec2ed794?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
    price: 49.99,
    genre: "Action Adventure",
    rating: 4,
    description: "Experience the rise of Miles Morales as the new hero masters incredible, explosive new powers to become his own Spider-Man.",
  },
];

export function GameGrid() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const filteredGames = gamesData.filter((game) => {
    const matchesSearch = game.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        game.genre.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (activeTab === "all") return matchesSearch;
    if (activeTab === "free") return matchesSearch && game.price === "Free";
    if (activeTab === "paid") return matchesSearch && game.price !== "Free";
    
    return matchesSearch;
  });

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="mb-12">
        <h2 className="text-3xl font-bold mb-2">Discover Games</h2>
        <p className="text-muted-foreground">Explore our collection of games</p>
      </div>
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 space-y-4 sm:space-y-0">
        <Tabs defaultValue="all" className="w-full sm:w-auto" onValueChange={setActiveTab}>
          <TabsList className="bg-secondary">
            <TabsTrigger value="all">All Games</TabsTrigger>
            <TabsTrigger value="free">Free Games</TabsTrigger>
            <TabsTrigger value="paid">Paid Games</TabsTrigger>
          </TabsList>
        </Tabs>
        
        <div className="relative w-full sm:w-64 md:w-80">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search games..."
            className="pl-10 pr-4"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredGames.length > 0 ? (
          filteredGames.map((game) => (
            <GameCard
              key={game.id}
              id={game.id}
              title={game.title}
              image={game.image}
              price={game.price}
              genre={game.genre}
              rating={game.rating}
              description={game.description}
            />
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <h3 className="text-xl font-medium mb-2">No games found</h3>
            <p className="text-muted-foreground">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>
    </section>
  );
}
