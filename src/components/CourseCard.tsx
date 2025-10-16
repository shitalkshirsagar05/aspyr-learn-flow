import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Code, Server, Palette, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface CourseCardProps {
  title: string;
  description: string;
  category: string;
  icon: string;
  progress: number;
  totalModules: number;
  completedModules: number;
  onClick: () => void;
}

const iconMap: Record<string, any> = {
  Code,
  Server,
  Palette,
};

export const CourseCard = ({ title, description, category, icon, progress, totalModules, completedModules, onClick }: CourseCardProps) => {
  const IconComponent = iconMap[icon] || Code;
  const isCompleted = progress === 100;

  return (
    <Card
      onClick={onClick}
      className={cn(
        "group cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-elevated bg-gradient-card border-border/50",
        "backdrop-blur-sm animate-fade-in"
      )}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-primary/20 group-hover:bg-primary/30 transition-colors">
              <IconComponent className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-xl mb-1 group-hover:text-secondary transition-colors">{title}</CardTitle>
              <Badge variant="secondary" className="text-xs">
                {category}
              </Badge>
            </div>
          </div>
          <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-secondary transition-all group-hover:translate-x-1" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <CardDescription className="text-sm">{description}</CardDescription>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">
              {completedModules} of {totalModules} modules
            </span>
            <span className={cn("font-medium", isCompleted ? "text-accent" : "text-secondary")}>{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </CardContent>
    </Card>
  );
};
