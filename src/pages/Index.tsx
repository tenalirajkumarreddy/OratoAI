import { Link } from "react-router-dom";
import { MessageSquare, UserCheck, Settings, ArrowRight, Mic, Brain, Star, Users, Clock, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const Index = () => {
  const features = [
    {
      icon: MessageSquare,
      title: "Practice English",
      description: "Have conversations with AI to improve your English speaking skills with real-time feedback and corrections.",
      color: "text-primary",
      bg: "bg-primary/10"
    },
    {
      icon: UserCheck,
      title: "AI Interviews",
      description: "Practice job interviews with AI interviewer. Upload your resume and get personalized questions for any role.",
      color: "text-accent",
      bg: "bg-accent/10"
    },
    {
      icon: Brain,
      title: "Voice Intelligence",
      description: "Advanced voice recognition and synthesis powered by cutting-edge AI for natural conversations.",
      color: "text-success",
      bg: "bg-success/10"
    },
    {
      icon: Settings,
      title: "Customizable",
      description: "Configure AI models, voice settings, difficulty levels, and practice modes to suit your learning style.",
      color: "text-warning",
      bg: "bg-warning/10"
    }
  ];

  const stats = [
    { icon: Users, label: "Active Users", value: "10K+", color: "text-primary" },
    { icon: Clock, label: "Practice Hours", value: "50K+", color: "text-accent" },
    { icon: Trophy, label: "Success Rate", value: "95%", color: "text-success" },
    { icon: Star, label: "User Rating", value: "4.9/5", color: "text-warning" }
  ];

  return (
    <div className="min-h-screen bg-background font-inter">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero opacity-50" />
        <div className="relative container mx-auto px-4 py-20 text-center">
          <div className="max-w-4xl mx-auto">
            <Badge className="mb-6 bg-primary/10 text-primary border-primary/20">
              AI-Powered English Learning Platform
            </Badge>
            
            <h1 className="text-5xl md:text-7xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-6 leading-tight">
              Master English with
              <br />
              AI Conversations
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
              Practice speaking English with advanced AI, get real-time feedback, and ace your interviews. 
              Your personal language coach available 24/7.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link to="/practice">
                <Button size="lg" className="text-lg px-8 py-4 shadow-elegant hover:shadow-glow transition-all duration-300">
                  <Mic className="w-5 h-5 mr-2" />
                  Start Practice
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              
              <Link to="/interview">
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="text-lg px-8 py-4 border-border bg-card hover:bg-muted transition-all duration-300"
                >
                  <UserCheck className="w-5 h-5 mr-2" />
                  Try Interview Mode
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg bg-card border border-border mb-2`}>
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                  <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Everything you need to improve your English
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            From casual conversations to job interview preparation, our AI-powered platform has you covered.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="p-8 bg-card border-border shadow-card hover:shadow-elegant transition-all duration-300 group">
              <div className="flex items-start space-x-4">
                <div className={`p-3 rounded-lg ${feature.bg} flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className={`w-6 h-6 ${feature.color}`} />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-foreground mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-primary text-primary-foreground">
        <div className="container mx-auto px-4 py-16 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to transform your English skills?
          </h2>
          <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
            Join thousands of learners who are already improving their English with our AI-powered platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/practice">
              <Button 
                size="lg" 
                variant="secondary"
                className="text-lg px-8 py-4 bg-background text-foreground hover:bg-muted transition-all duration-300"
              >
                Get Started Free
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link to="/settings">
              <Button 
                size="lg" 
                variant="outline"
                className="text-lg px-8 py-4 border-background/20 text-primary-foreground hover:bg-background/10 transition-all duration-300"
              >
                <Settings className="w-5 h-5 mr-2" />
                Configure Settings
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
