import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { 
  Upload, 
  Flame, 
  BookOpen, 
  CheckCircle, 
  Trophy,
  Sparkles,
  Moon,
  Sun,
  Zap
} from "lucide-react";

interface Profile {
  id: string;
  username: string;
  profile_photo: string | null;
  tagline: string;
  theme: string;
  cover_image: string | null;
  learning_mood: string;
  daily_journal: string | null;
  streak_days: number;
}

interface Stats {
  coursesEnrolled: number;
  modulesCompleted: number;
  totalModules: number;
  completionPercentage: number;
}

const Profile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [stats, setStats] = useState<Stats>({
    coursesEnrolled: 0,
    modulesCompleted: 0,
    totalModules: 0,
    completionPercentage: 0,
  });
  const [editMode, setEditMode] = useState(false);
  const [editedTagline, setEditedTagline] = useState("");
  const [editedMood, setEditedMood] = useState("");
  const [editedJournal, setEditedJournal] = useState("");

  useEffect(() => {
    checkUser();
    fetchProfile();
    fetchStats();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) navigate("/auth");
  };

  const fetchProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (data) {
      setProfile(data);
      setEditedTagline(data.tagline || "");
      setEditedMood(data.learning_mood || "");
      setEditedJournal(data.daily_journal || "");
    }
  };

  const fetchStats = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Get total courses
    const { data: courses } = await supabase.from("courses").select("id");
    
    // Get user completions
    const { data: completions } = await supabase
      .from("completions")
      .select("module_id")
      .eq("user_id", user.id);

    // Get total modules
    const { data: modules } = await supabase.from("modules").select("id");

    const coursesEnrolled = courses?.length || 0;
    const modulesCompleted = completions?.length || 0;
    const totalModules = modules?.length || 0;
    const completionPercentage = totalModules > 0 
      ? Math.round((modulesCompleted / totalModules) * 100) 
      : 0;

    setStats({
      coursesEnrolled,
      modulesCompleted,
      totalModules,
      completionPercentage,
    });
  };

  const saveProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from("profiles")
      .update({
        tagline: editedTagline,
        learning_mood: editedMood,
        daily_journal: editedJournal,
      })
      .eq("id", user.id);

    if (!error) {
      toast({
        title: "Profile updated! ✨",
        description: "Your changes have been saved.",
      });
      setEditMode(false);
      fetchProfile();
    }
  };

  const updateTheme = async (newTheme: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from("profiles")
      .update({ theme: newTheme })
      .eq("id", user.id);

    if (!error) {
      setProfile(prev => prev ? { ...prev, theme: newTheme } : null);
      toast({
        title: "Theme changed! 🎨",
        description: `Switched to ${newTheme} mode`,
      });
    }
  };

  const achievements = [
    {
      title: "Consistency Star",
      description: "Learning streak of 7+ days",
      icon: <Flame className="w-6 h-6" />,
      unlocked: (profile?.streak_days || 0) >= 7,
      quote: "Consistency breeds excellence"
    },
    {
      title: "UI Pro",
      description: "Completed UI Magic course",
      icon: <Sparkles className="w-6 h-6" />,
      unlocked: stats.completionPercentage >= 33,
      quote: "Design is intelligence made visible"
    },
    {
      title: "Backend Explorer",
      description: "Completed Backend Essentials",
      icon: <Zap className="w-6 h-6" />,
      unlocked: stats.completionPercentage >= 66,
      quote: "Logic is the backbone of innovation"
    },
  ];

  if (!profile) return null;

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Cover Image */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative h-48 md:h-64 rounded-3xl overflow-hidden bg-gradient-card"
        >
          {profile.cover_image && (
            <img src={profile.cover_image} alt="Cover" className="w-full h-full object-cover" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
        </motion.div>

        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="-mt-20 relative z-10"
        >
          <Card className="border-2 border-primary/20 bg-card/95 backdrop-blur-lg">
            <CardContent className="pt-16 pb-8">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                {/* Profile Photo */}
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="relative group"
                >
                  <div className="absolute inset-0 bg-gradient-primary rounded-full blur-xl opacity-50 group-hover:opacity-100 transition-opacity animate-glow-pulse" />
                  <Avatar className="w-32 h-32 border-4 border-primary relative">
                    <AvatarImage src={profile.profile_photo || undefined} />
                    <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                      {profile.username?.[0]?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <Button
                    size="icon"
                    className="absolute bottom-0 right-0 rounded-full"
                    variant="secondary"
                  >
                    <Upload className="w-4 h-4" />
                  </Button>
                </motion.div>

                {/* Info */}
                <div className="flex-1 text-center md:text-left space-y-3">
                  <h1 className="text-3xl md:text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                    {profile.username}
                  </h1>
                  {editMode ? (
                    <Input
                      value={editedTagline}
                      onChange={(e) => setEditedTagline(e.target.value)}
                      className="max-w-md"
                      placeholder="Your tagline..."
                    />
                  ) : (
                    <p className="text-lg text-muted-foreground">{profile.tagline}</p>
                  )}
                  <div className="flex gap-2 justify-center md:justify-start">
                    <Button
                      onClick={() => editMode ? saveProfile() : setEditMode(true)}
                      variant={editMode ? "default" : "outline"}
                    >
                      {editMode ? "Save Changes" : "Edit Profile"}
                    </Button>
                    {editMode && (
                      <Button variant="ghost" onClick={() => setEditMode(false)}>
                        Cancel
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="border-primary/30 bg-gradient-card hover:shadow-glow transition-all">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <BookOpen className="w-8 h-8 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Courses Enrolled</p>
                    <p className="text-3xl font-bold">{stats.coursesEnrolled}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="border-primary/30 bg-gradient-card hover:shadow-glow transition-all">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-8 h-8 text-secondary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Modules Completed</p>
                    <p className="text-3xl font-bold">
                      {stats.modulesCompleted}/{stats.totalModules}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="border-primary/30 bg-gradient-card hover:shadow-glow transition-all">
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Completion</p>
                  <div className="flex items-center gap-3">
                    <Progress value={stats.completionPercentage} className="flex-1" />
                    <span className="text-2xl font-bold">{stats.completionPercentage}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="border-primary/30 bg-gradient-card hover:shadow-glow transition-all">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <Flame className="w-8 h-8 text-accent" />
                  <div>
                    <p className="text-sm text-muted-foreground">Daily Streak</p>
                    <p className="text-3xl font-bold">{profile.streak_days} days</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Achievements */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-6 h-6 text-accent" />
                  Achievements 🏆
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {achievements.map((achievement, idx) => (
                  <motion.div
                    key={idx}
                    whileHover={{ scale: 1.02, x: 4 }}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      achievement.unlocked
                        ? "border-secondary bg-secondary/10 shadow-glow"
                        : "border-muted bg-muted/5 opacity-60"
                    }`}
                  >
                    <div className="flex gap-3">
                      <div className={achievement.unlocked ? "text-secondary" : "text-muted-foreground"}>
                        {achievement.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold">{achievement.title}</h3>
                        <p className="text-sm text-muted-foreground">{achievement.description}</p>
                        <p className="text-xs italic mt-2 text-primary">"{achievement.quote}"</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          {/* Customization & Insights */}
          <div className="space-y-6">
            {/* Customization */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 }}
            >
              <Card className="border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="w-6 h-6 text-secondary" />
                    Customization ✨
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-medium mb-2">Choose Theme</p>
                    <div className="flex gap-2">
                      <Button
                        variant={profile.theme === "dark" ? "default" : "outline"}
                        size="sm"
                        onClick={() => updateTheme("dark")}
                      >
                        <Moon className="w-4 h-4 mr-2" />
                        Dark
                      </Button>
                      <Button
                        variant={profile.theme === "light" ? "default" : "outline"}
                        size="sm"
                        onClick={() => updateTheme("light")}
                      >
                        <Sun className="w-4 h-4 mr-2" />
                        Light
                      </Button>
                      <Button
                        variant={profile.theme === "neon" ? "default" : "outline"}
                        size="sm"
                        onClick={() => updateTheme("neon")}
                      >
                        <Zap className="w-4 h-4 mr-2" />
                        Neon
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Personal Insights */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 }}
            >
              <Card className="border-primary/20">
                <CardHeader>
                  <CardTitle>Personal Insights</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Learning Mood</label>
                    {editMode ? (
                      <Input
                        value={editedMood}
                        onChange={(e) => setEditedMood(e.target.value)}
                        placeholder="e.g., Feeling Curious 😎"
                        className="mt-1"
                      />
                    ) : (
                      <p className="text-muted-foreground mt-1">{profile.learning_mood}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium">What did you learn today?</label>
                    {editMode ? (
                      <Textarea
                        value={editedJournal}
                        onChange={(e) => setEditedJournal(e.target.value)}
                        placeholder="Share your learning journey..."
                        className="mt-1"
                        rows={4}
                      />
                    ) : (
                      <p className="text-muted-foreground mt-1 whitespace-pre-wrap">
                        {profile.daily_journal || "No entry yet..."}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="text-center py-8"
        >
          <p className="text-muted-foreground text-lg">
            Every small step counts 🌱 – Keep Aspyring higher!
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Profile;