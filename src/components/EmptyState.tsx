import { Link } from 'react-router-dom';

type EmptyAction = {
    text: string;
    to: string;
};

interface EmptyStateProps {
    icon?: string;
    title?: string;
    message: string;
    action?: EmptyAction;
    className?: string;
}

function EmptyState({ icon, title, message, action, className = '' }: EmptyStateProps) {
    return (
        <div className={`empty-state ${className}`.trim()}>
            {icon && <div className="empty-icon">{icon}</div>}
            {title && <h2>{title}</h2>}
            <p>{message}</p>
            {action && (
                <Link to={action.to} className="primary-btn">
                    {action.text}
                </Link>
            )}
        </div>
    );
}

export default EmptyState;


