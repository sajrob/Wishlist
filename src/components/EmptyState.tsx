/**
 * EmptyState component that displays a placeholder message when there is no content to show.
 * Useful for guiding users to take an action, like adding their first item or creating a wishlist.
 */
import { IconPackage } from "@tabler/icons-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

type EmptyAction = {
  text: string;
  to?: string;
  onClick?: () => void;
};

interface EmptyStateProps {
  icon?: React.ReactNode;
  title?: string;
  message: string;
  action?: EmptyAction;
  className?: string;
  children?: React.ReactNode;
}

function EmptyState({
  icon,
  title,
  message,
  action,
  className = "",
  children,
}: EmptyStateProps) {
  return (
    <Empty className={`border-dashed pt-2 pb-8 px-8 ${className}`}>
      <EmptyHeader>
        <EmptyMedia variant="icon" className="mb-1">
          {icon ? (
            typeof icon === "string" ? (
              <span className="text-2xl">{icon}</span>
            ) : (
              icon
            )
          ) : (
            <IconPackage className="size-8 text-muted-foreground" />
          )}
        </EmptyMedia>
        <EmptyTitle>{title || "No items found"}</EmptyTitle>
        <EmptyDescription>{message}</EmptyDescription>
      </EmptyHeader>
      {(action || children) && (
        <EmptyContent className="mt-2">
          {action &&
            (action.onClick ? (
              <Button onClick={action.onClick}>{action.text}</Button>
            ) : (
              <Button asChild>
                <Link to={action.to || "#"}>{action.text}</Link>
              </Button>
            ))}
          {children}
        </EmptyContent>
      )}
    </Empty>
  );
}

export default EmptyState;
