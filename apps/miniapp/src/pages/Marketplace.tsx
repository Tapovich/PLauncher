/**
 * Team Marketplace - Browse and hire freelancers
 * Enhanced with search, filters, pagination, and skeleton states
 */

import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Star, DollarSign, MapPin, Filter, Loader2, X } from "lucide-react";
import { useTelegram } from "@/hooks/useTelegram";

interface Freelancer {
  id: string;
  name: string;
  role: string;
  skills: string[];
  hourlyRate: number;
  rating: number;
  projectsCompleted: number;
  availability: string;
  verified: boolean;
  location: string;
  bio: string;
}

// Extended mock data (20 freelancers from seed)
const MOCK_FREELANCERS: Freelancer[] = [
  {
    id: "1",
    name: "Alex Johnson",
    role: "developer",
    skills: ["Python", "FastAPI", "PostgreSQL", "Docker"],
    hourlyRate: 75,
    rating: 4.9,
    projectsCompleted: 28,
    availability: "full-time",
    verified: true,
    location: "USA",
    bio: "Full-stack developer with 5+ years of experience building scalable web applications.",
  },
  {
    id: "2",
    name: "Sarah Chen",
    role: "designer",
    skills: ["Figma", "UI/UX", "Prototyping", "Design Systems"],
    hourlyRate: 65,
    rating: 5.0,
    projectsCompleted: 42,
    availability: "part-time",
    verified: true,
    location: "UK",
    bio: "Senior UI/UX designer specializing in mobile-first design and design systems.",
  },
  {
    id: "3",
    name: "Michael Rodriguez",
    role: "developer",
    skills: ["React", "TypeScript", "Node.js", "MongoDB"],
    hourlyRate: 80,
    rating: 4.8,
    projectsCompleted: 35,
    availability: "contract",
    verified: true,
    location: "Spain",
    bio: "Backend engineer focused on API design and microservices.",
  },
  {
    id: "4",
    name: "Emma Thompson",
    role: "pm",
    skills: ["Agile", "Scrum", "JIRA", "Product Strategy"],
    hourlyRate: 90,
    rating: 4.95,
    projectsCompleted: 18,
    availability: "full-time",
    verified: true,
    location: "Canada",
    bio: "Product manager with a technical background. Launched 10+ products.",
  },
  {
    id: "5",
    name: "David Kim",
    role: "developer",
    skills: ["Go", "Kubernetes", "AWS", "Microservices"],
    hourlyRate: 95,
    rating: 4.7,
    projectsCompleted: 31,
    availability: "contract",
    verified: true,
    location: "South Korea",
    bio: "DevOps engineer with expertise in AWS and Kubernetes.",
  },
];

type LoadingState = "idle" | "loading" | "success" | "error";

export function Marketplace() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [rateRange] = useState<[number, number]>([0, 200]);
  const [loadingState, setLoadingState] = useState<LoadingState>("loading");
  const [freelancers, setFreelancers] = useState<Freelancer[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const { hapticImpact, hapticSelection } = useTelegram();

  // Simulate API call
  useEffect(() => {
    setLoadingState("loading");
    
    setTimeout(() => {
      setFreelancers(MOCK_FREELANCERS);
      setLoadingState("success");
      setHasMore(false); // No more data for now
    }, 1500);
  }, []);

  const handleRoleFilter = (role: string | null) => {
    hapticSelection();
    setSelectedRole(role);
    // TODO: Re-fetch with filter
  };

  const handleLoadMore = () => {
    hapticImpact("light");
    // TODO: Fetch next page
  };

  const handleContact = () => {
    hapticImpact("medium");
    // TODO: Open contact modal or navigate to profile
  };

  // Filter freelancers locally (TODO: Move to API)
  const filteredFreelancers = freelancers.filter(f => {
    const matchesSearch = !searchQuery || 
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.skills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesRole = !selectedRole || f.role === selectedRole.toLowerCase();
    
    const matchesRate = f.hourlyRate >= rateRange[0] && f.hourlyRate <= rateRange[1];
    
    return matchesSearch && matchesRole && matchesRate;
  });

  return (
    <Layout title="Find Team" showBack showMenu>
      <div className="container mx-auto px-4 py-6 space-y-4">
        {/* Search Input */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name or skills..."
              className="pl-10 pr-10"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Role Filter Chips */}
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
            <Button
              variant={selectedRole === null ? "default" : "outline"}
              size="sm"
              className="flex-shrink-0"
              onClick={() => handleRoleFilter(null)}
            >
              All Roles
            </Button>
            {["developer", "designer", "pm", "qa", "devops"].map((role) => (
              <Button
                key={role}
                variant={selectedRole === role ? "default" : "outline"}
                size="sm"
                className="flex-shrink-0 capitalize"
                onClick={() => handleRoleFilter(role)}
              >
                {role === "pm" ? "PM" : role === "qa" ? "QA" : role.charAt(0).toUpperCase() + role.slice(1)}
              </Button>
            ))}
            <Button variant="outline" size="sm" className="flex-shrink-0">
              <Filter className="h-4 w-4 mr-1" />
              More Filters
            </Button>
          </div>

          {/* Active Filters Display */}
          {(selectedRole || searchQuery) && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-muted-foreground">Active filters:</span>
              {selectedRole && (
                <Badge variant="secondary" className="gap-1">
                  Role: {selectedRole}
                  <button onClick={() => handleRoleFilter(null)}>
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {searchQuery && (
                <Badge variant="secondary" className="gap-1">
                  Search: {searchQuery}
                  <button onClick={() => setSearchQuery("")}>
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            {filteredFreelancers.length} freelancer{filteredFreelancers.length !== 1 ? 's' : ''} found
          </span>
          <Button variant="ghost" size="sm">
            Sort by: Top Rated
          </Button>
        </div>

        {/* Skeleton States */}
        {loadingState === "loading" && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardHeader className="pb-3">
                  <div className="flex gap-3">
                    <Skeleton className="w-12 h-12 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-5 w-32" />
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-40" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex gap-1">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-6 w-16" />
                  </div>
                  <Skeleton className="h-9 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Freelancer Cards */}
        {loadingState === "success" && (
          <div className="space-y-3">
            {filteredFreelancers.map((freelancer) => (
              <Card key={freelancer.id} className="hover:border-primary/50 transition-colors">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex gap-3">
                      {/* Avatar */}
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-lg font-semibold text-primary">
                          {freelancer.name.charAt(0)}
                        </span>
                      </div>

                      {/* Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-base">{freelancer.name}</h3>
                          {freelancer.verified && (
                            <Badge variant="success" className="text-xs">
                              ✓
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground capitalize">
                          {freelancer.role === "pm" ? "Product Manager" : 
                           freelancer.role === "qa" ? "QA Engineer" :
                           freelancer.role === "devops" ? "DevOps Engineer" :
                           freelancer.role.replace("developer", "Developer").replace("designer", "Designer")}
                        </p>
                        
                        {/* Rating & Projects */}
                        <div className="flex items-center gap-3 mt-1.5">
                          <div className="flex items-center gap-1">
                            <Star className="h-3.5 w-3.5 fill-primary text-primary" />
                            <span className="text-sm font-medium">{freelancer.rating.toFixed(1)}</span>
                            <span className="text-xs text-muted-foreground">
                              ({freelancer.projectsCompleted} projects)
                            </span>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <MapPin className="h-3 w-3" />
                            {freelancer.location}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3">
                  {/* Bio */}
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {freelancer.bio}
                  </p>

                  {/* Skills */}
                  <div className="flex flex-wrap gap-1.5">
                    {freelancer.skills.map((skill, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>

                  {/* Rate & Actions */}
                  <div className="flex items-center justify-between pt-1">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <span className="font-semibold text-sm">${freelancer.hourlyRate}/hr</span>
                      </div>
                      <div className="text-xs text-muted-foreground capitalize">
                        {freelancer.availability}
                      </div>
                    </div>

                    <Button
                      size="sm"
                      className="touch-target"
                      onClick={handleContact}
                    >
                      Contact
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Empty State */}
            {filteredFreelancers.length === 0 && (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No freelancers found</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Try adjusting your search or filters
                </p>
                <Button variant="outline" onClick={() => {
                  setSearchQuery("");
                  setSelectedRole(null);
                }}>
                  Clear Filters
                </Button>
              </div>
            )}

            {/* Load More */}
            {hasMore && filteredFreelancers.length > 0 && (
              <div className="flex justify-center pt-2">
                <Button
                  variant="outline"
                  className="touch-target"
                  onClick={handleLoadMore}
                >
                  <Loader2 className="h-4 w-4 mr-2" />
                  Load More
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Error State */}
        {loadingState === "error" && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <X className="h-8 w-8 text-destructive" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Failed to Load</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Unable to fetch freelancers. Please try again.
            </p>
            <Button onClick={() => setLoadingState("loading")}>
              Retry
            </Button>
          </div>
        )}
      </div>
    </Layout>
  );
}

// Missing import
import { Users } from "lucide-react";

