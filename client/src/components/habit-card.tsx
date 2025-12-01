import { useState } from "react";
import { Trash2, Edit2, Flame, Check } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import type { Habit } from "@shared/schema";

interface HabitCardProps {
  habit: Habit;
  isCompletedToday: boolean;
  completionRate: number;
  onToggleToday: (id: string) => void;
  onUpdate: (id: string, updates: Partial<Habit>) => void;
  onDelete: (id: string) => void;
}

const colorOptions = [
  { value: "#14B8A6", label: "Teal" },
  { value: "#F97316", label: "Orange" },
  { value: "#8B5CF6", label: "Purple" },
  { value: "#3B82F6", label: "Blue" },
  { value: "#EF4444", label: "Red" },
  { value: "#22C55E", label: "Green" },
  { value: "#EC4899", label: "Pink" },
];

export function HabitCard({
  habit,
  isCompletedToday,
  completionRate,
  onToggleToday,
  onUpdate,
  onDelete,
}: HabitCardProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editName, setEditName] = useState(habit.name);
  const [editDescription, setEditDescription] = useState(habit.description);
  const [editColor, setEditColor] = useState(habit.color);

  const handleSaveEdit = () => {
    onUpdate(habit.id, {
      name: editName,
      description: editDescription,
      color: editColor,
    });
    setIsEditOpen(false);
  };

  const handleOpenEdit = () => {
    setEditName(habit.name);
    setEditDescription(habit.description);
    setEditColor(habit.color);
    setIsEditOpen(true);
  };

  return (
    <>
      <Card className="p-4 hover-elevate" data-testid={`habit-card-${habit.id}`}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <div
                className="h-3 w-3 rounded-full shrink-0"
                style={{ backgroundColor: habit.color }}
              />
              <h3 className="font-medium text-sm truncate" data-testid={`text-habit-name-${habit.id}`}>
                {habit.name}
              </h3>
            </div>
            
            {habit.description && (
              <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                {habit.description}
              </p>
            )}

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <Flame className="h-4 w-4 text-orange-500" />
                <span className="text-sm font-medium" data-testid={`text-habit-streak-${habit.id}`}>
                  {habit.streak}
                </span>
                <span className="text-xs text-muted-foreground">day streak</span>
              </div>
              
              <Badge variant="outline" className="text-xs">
                {completionRate}% this week
              </Badge>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2">
            <Button
              variant={isCompletedToday ? "default" : "outline"}
              size="sm"
              className="gap-1.5"
              onClick={() => onToggleToday(habit.id)}
              data-testid={`button-toggle-habit-${habit.id}`}
            >
              {isCompletedToday ? (
                <>
                  <Check className="h-4 w-4" />
                  Done
                </>
              ) : (
                "Mark Done"
              )}
            </Button>
            
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={handleOpenEdit}
                data-testid={`button-edit-habit-${habit.id}`}
              >
                <Edit2 className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-destructive hover:text-destructive"
                onClick={() => onDelete(habit.id)}
                data-testid={`button-delete-habit-${habit.id}`}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground">Weekly progress</span>
            <span className="text-xs font-medium">{completionRate}%</span>
          </div>
          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${completionRate}%`,
                backgroundColor: habit.color,
              }}
            />
          </div>
        </div>
      </Card>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Habit</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-habit-name">Name</Label>
              <Input
                id="edit-habit-name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Habit name"
                data-testid="input-edit-habit-name"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-habit-description">Description</Label>
              <Textarea
                id="edit-habit-description"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                placeholder="Habit description"
                className="resize-none"
                data-testid="input-edit-habit-description"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Color</Label>
              <div className="flex flex-wrap gap-2">
                {colorOptions.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    className={`h-8 w-8 rounded-full transition-all ${
                      editColor === color.value
                        ? "ring-2 ring-offset-2 ring-primary"
                        : ""
                    }`}
                    style={{ backgroundColor: color.value }}
                    onClick={() => setEditColor(color.value)}
                    title={color.label}
                    data-testid={`button-color-${color.label.toLowerCase()}`}
                  />
                ))}
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} data-testid="button-save-edit-habit">
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
