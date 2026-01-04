import { IconPackage } from "@tabler/icons-react";
import { Link } from 'react-router-dom';
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

function EmptyState({ icon, title, message, action, className = '', children }: EmptyStateProps) {
    return (
        <Empty className={`border-dashed ${className}`}>
            <EmptyHeader>
                <EmptyMedia variant="icon">
                    {icon ? (
                        typeof icon === 'string' ? <span className="text-2xl">{icon}</span> : icon
                    ) : (
                        <IconPackage className="size-8 text-muted-foreground" />
                    )}
                </EmptyMedia>
                <EmptyTitle>{title || "No items found"}</EmptyTitle>
                <EmptyDescription>
                    {message}
                </EmptyDescription>
            </EmptyHeader>
            {(action || children) && (
                <EmptyContent>
                    {children}
                    {action && (
                        action.onClick ? (
                            <Button onClick={action.onClick}>
                                {action.text}
                            </Button>
                        ) : (
                            <Button asChild>
                                <Link to={action.to || '#'}>
                                    {action.text}
                                </Link>
                            </Button>
                        )
                    )}
                </EmptyContent>
            )}
        </Empty>
    );
}

export default EmptyState;


