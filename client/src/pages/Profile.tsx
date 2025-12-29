import AppShell from "@/components/layout/AppShell";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Github, Twitter, Linkedin, Edit2 } from "lucide-react";

export default function Profile() {
  return (
    <AppShell>
      <div className="space-y-8">
        <div className="flex flex-col items-center space-y-4 text-center">
          <div className="relative">
            <Avatar className="w-24 h-24 border-4 border-background shadow-xl">
              <AvatarImage src="https://github.com/shadcn.png" />
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
            <Button size="icon" variant="secondary" className="absolute bottom-0 right-0 rounded-full h-8 w-8 shadow-md">
              <Edit2 className="h-3 w-3" />
            </Button>
          </div>
          <div>
             <h1 className="text-2xl font-bold font-display">Jane Doe</h1>
             <p className="text-muted-foreground">Full Stack Developer</p>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" size="icon" className="rounded-full">
              <Github className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" className="rounded-full">
              <Twitter className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" className="rounded-full">
              <Linkedin className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <Separator />
        
        <div className="space-y-6">
          <h2 className="font-semibold text-lg">Personal Information</h2>
          
          <Card className="border-border/50">
            <CardContent className="p-6 space-y-4">
              <div className="space-y-2">
                <Label>Display Name</Label>
                <Input defaultValue="Jane Doe" />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input defaultValue="jane@example.com" disabled />
              </div>
              <div className="space-y-2">
                <Label>Bio</Label>
                <Input defaultValue="Passionate about building scalable systems." />
              </div>
              
              <Button className="w-full mt-4">Save Changes</Button>
            </CardContent>
          </Card>
          
          <h2 className="font-semibold text-lg">Stats Overview</h2>
          <div className="grid grid-cols-2 gap-4">
            <Card className="bg-muted/30 border-none">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Global Rank</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">#14,203</div>
              </CardContent>
            </Card>
            <Card className="bg-muted/30 border-none">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Competitions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">4</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
