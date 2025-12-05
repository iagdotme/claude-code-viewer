import { Trans } from "@lingui/react";
import { Link } from "@tanstack/react-router";
import { FolderIcon, LayoutGridIcon, ListIcon } from "lucide-react";
import type { FC } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatLocaleDate } from "../../../lib/date/formatLocaleDate";
import { useConfig } from "../../hooks/useConfig";
import { useProjects } from "../hooks/useProjects";

export const ProjectList: FC = () => {
  const {
    data: { projects },
  } = useProjects();
  const { config, updateConfig } = useConfig();
  const viewMode = config.projectViewMode ?? "card";

  if (projects.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <FolderIcon className="w-12 h-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">
            <Trans id="project_list.no_projects.title" />
          </h3>
          <p className="text-muted-foreground text-center max-w-md">
            <Trans id="project_list.no_projects.description" />
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with view toggle */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {projects.length} <Trans id="project_list.projects_count" />
        </p>
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={viewMode === "card" ? "secondary" : "ghost"}
                size="icon"
                className="h-8 w-8"
                onClick={() =>
                  updateConfig({ ...config, projectViewMode: "card" })
                }
              >
                <LayoutGridIcon className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Card View</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={viewMode === "list" ? "secondary" : "ghost"}
                size="icon"
                className="h-8 w-8"
                onClick={() =>
                  updateConfig({ ...config, projectViewMode: "list" })
                }
              >
                <ListIcon className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>List View</TooltipContent>
          </Tooltip>
        </div>
      </div>

      {/* List View */}
      {viewMode === "list" && (
        <div className="border rounded-lg divide-y">
          {projects.map((project) => (
            <Link
              key={project.id}
              to={"/projects/$projectId/session"}
              params={{ projectId: project.id }}
              className="flex items-center gap-4 p-3 hover:bg-muted/50 transition-colors"
            >
              <FolderIcon className="w-5 h-5 text-muted-foreground shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">
                  {project.meta.projectName ?? project.claudeProjectPath}
                </p>
                {project.meta.projectPath && (
                  <p className="text-xs text-muted-foreground truncate">
                    {project.meta.projectPath}
                  </p>
                )}
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm text-muted-foreground">
                  {project.meta.sessionCount} sessions
                </p>
                <p className="text-xs text-muted-foreground">
                  {project.lastModifiedAt
                    ? formatLocaleDate(project.lastModifiedAt, {
                        locale: config.locale,
                        target: "time",
                      })
                    : ""}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Card View */}
      {viewMode === "card" && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Card key={project.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FolderIcon className="w-5 h-5" />
                  <span className="truncate">
                    {project.meta.projectName ?? project.claudeProjectPath}
                  </span>
                </CardTitle>
                {project.meta.projectPath ? (
                  <CardDescription>{project.meta.projectPath}</CardDescription>
                ) : null}
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  <Trans id="project_list.last_modified" />{" "}
                  {project.lastModifiedAt
                    ? formatLocaleDate(project.lastModifiedAt, {
                        locale: config.locale,
                        target: "time",
                      })
                    : ""}
                </p>
                <p className="text-xs text-muted-foreground">
                  <Trans id="project_list.messages" /> {project.meta.sessionCount}
                </p>
              </CardContent>
              <CardContent className="pt-0">
                <Button asChild className="w-full">
                  <Link
                    to={"/projects/$projectId/session"}
                    params={{ projectId: project.id }}
                  >
                    <Trans id="project_list.view_conversations" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
