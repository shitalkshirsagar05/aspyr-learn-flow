import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle2, Circle } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Module {
  id: string;
  title: string;
  description: string;
  duration: string;
  completed: boolean;
}

interface ModuleListProps {
  courseTitle: string;
  modules: Module[];
  onToggleModule: (moduleId: string) => void;
  onMarkAllComplete: () => void;
  onBack: () => void;
}

export const ModuleList = ({ courseTitle, modules, onToggleModule, onMarkAllComplete, onBack }: ModuleListProps) => {
  const completedCount = modules.filter((m) => m.completed).length;
  const progress = Math.round((completedCount / modules.length) * 100);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <Button variant="ghost" onClick={onBack} className="mb-2 -ml-4 text-secondary hover:text-secondary/80">
            ← Back to Courses
          </Button>
          <h2 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">{courseTitle}</h2>
          <p className="text-muted-foreground mt-1">
            {completedCount} of {modules.length} modules completed ({progress}%)
          </p>
        </div>
        <Button onClick={onMarkAllComplete} variant="secondary" disabled={completedCount === modules.length}>
          Mark All Complete
        </Button>
      </div>

      <div className="grid gap-4">
        {modules.map((module, index) => (
          <Card
            key={module.id}
            className={cn(
              "transition-all duration-300 hover:shadow-card bg-gradient-card border-border/50",
              module.completed && "opacity-75"
            )}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="pt-1">
                  <Checkbox
                    checked={module.completed}
                    onCheckedChange={() => onToggleModule(module.id)}
                    className="h-5 w-5 border-2 border-primary data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                  />
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    {module.completed ? (
                      <CheckCircle2 className="h-5 w-5 text-accent" />
                    ) : (
                      <Circle className="h-5 w-5 text-muted-foreground" />
                    )}
                    <h3 className={cn("text-lg font-semibold", module.completed && "line-through text-muted-foreground")}>
                      {module.title}
                    </h3>
                  </div>
                  <p className="text-sm text-muted-foreground">{module.description}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" />
                    <span>{module.duration}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
