import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { CourseCard } from "@/components/CourseCard";
import { ModuleList } from "@/components/ModuleList";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  icon: string;
  color: string;
}

interface Module {
  id: string;
  course_id: string;
  title: string;
  description: string;
  order_index: number;
  duration: string;
}

interface Completion {
  module_id: string;
}

const Dashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [completions, setCompletions] = useState<Completion[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [filter, setFilter] = useState<"all" | "in-progress" | "completed">("all");
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (!session?.user) {
        navigate("/auth");
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (!session?.user) {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    const [coursesRes, modulesRes, completionsRes] = await Promise.all([
      supabase.from("courses").select("*"),
      supabase.from("modules").select("*").order("order_index"),
      supabase.from("completions").select("module_id").eq("user_id", user!.id),
    ]);

    if (coursesRes.data) setCourses(coursesRes.data);
    if (modulesRes.data) setModules(modulesRes.data);
    if (completionsRes.data) setCompletions(completionsRes.data);
  };

  const getCourseProgress = (courseId: string) => {
    const courseModules = modules.filter((m) => m.course_id === courseId);
    const completedModules = courseModules.filter((m) => completions.some((c) => c.module_id === m.id));
    return {
      total: courseModules.length,
      completed: completedModules.length,
      progress: courseModules.length > 0 ? Math.round((completedModules.length / courseModules.length) * 100) : 0,
    };
  };

  const getFilteredCourses = () => {
    return courses.filter((course) => {
      const { progress } = getCourseProgress(course.id);
      if (filter === "completed") return progress === 100;
      if (filter === "in-progress") return progress > 0 && progress < 100;
      return true;
    });
  };

  const toggleModule = async (moduleId: string) => {
    const isCompleted = completions.some((c) => c.module_id === moduleId);

    if (isCompleted) {
      const { error } = await supabase.from("completions").delete().eq("user_id", user!.id).eq("module_id", moduleId);
      if (error) {
        toast.error("Failed to update progress");
        return;
      }
      setCompletions((prev) => prev.filter((c) => c.module_id !== moduleId));
      toast.success("Module marked as incomplete");
    } else {
      const { error } = await supabase.from("completions").insert({ user_id: user!.id, module_id: moduleId });
      if (error) {
        toast.error("Failed to update progress");
        return;
      }
      setCompletions((prev) => [...prev, { module_id: moduleId }]);
      toast.success("Module completed! 🎉");
    }
  };

  const markAllComplete = async () => {
    if (!selectedCourse) return;

    const courseModules = modules.filter((m) => m.course_id === selectedCourse.id);
    const newCompletions = courseModules
      .filter((m) => !completions.some((c) => c.module_id === m.id))
      .map((m) => ({ user_id: user!.id, module_id: m.id }));

    if (newCompletions.length === 0) {
      toast.info("All modules already completed!");
      return;
    }

    const { error } = await supabase.from("completions").insert(newCompletions);
    if (error) {
      toast.error("Failed to mark all as complete");
      return;
    }

    setCompletions((prev) => [...prev, ...newCompletions.map((c) => ({ module_id: c.module_id }))]);
    toast.success("All modules completed! 🎊");
  };

  if (!user) return null;

  const filteredCourses = getFilteredCourses();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <header className="h-16 border-b border-border flex items-center px-6 bg-card/50 backdrop-blur-sm sticky top-0 z-10">
            <SidebarTrigger className="mr-4" />
            <h1 className="text-xl font-semibold">
              {selectedCourse ? selectedCourse.title : `Welcome back, ${user.email?.split("@")[0]}! 👋`}
            </h1>
          </header>

          <main className="flex-1 p-6 overflow-auto">
            {!selectedCourse ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">Your Learning Path</h2>
                  <Tabs value={filter} onValueChange={(v) => setFilter(v as any)}>
                    <TabsList className="bg-card border border-border">
                      <TabsTrigger value="all">All Courses</TabsTrigger>
                      <TabsTrigger value="in-progress">In Progress</TabsTrigger>
                      <TabsTrigger value="completed">Completed</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {filteredCourses.map((course, index) => {
                    const { total, completed, progress } = getCourseProgress(course.id);
                    return (
                      <div key={course.id} style={{ animationDelay: `${index * 0.1}s` }}>
                        <CourseCard
                          title={course.title}
                          description={course.description || ""}
                          category={course.category}
                          icon={course.icon || "Code"}
                          progress={progress}
                          totalModules={total}
                          completedModules={completed}
                          onClick={() => setSelectedCourse(course)}
                        />
                      </div>
                    );
                  })}
                </div>

                {filteredCourses.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    No courses found for this filter. Try a different filter!
                  </div>
                )}
              </div>
            ) : (
              <ModuleList
                courseTitle={selectedCourse.title}
                modules={modules
                  .filter((m) => m.course_id === selectedCourse.id)
                  .map((m) => ({
                    ...m,
                    completed: completions.some((c) => c.module_id === m.id),
                  }))}
                onToggleModule={toggleModule}
                onMarkAllComplete={markAllComplete}
                onBack={() => setSelectedCourse(null)}
              />
            )}
          </main>

          <footer className="border-t border-border bg-card/50 backdrop-blur-sm py-4 px-6 text-center text-sm text-muted-foreground">
            Built with 💜 by Aspyr – Empowering the next-gen learners.
          </footer>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;
