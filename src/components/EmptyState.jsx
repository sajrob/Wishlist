import { Link } from 'react-router-dom';

/**
 * Empty state component for consistent empty displays
 * 
 * @param {Object} props
 * @param {string} [props.icon] - Emoji or icon to display
 * @param {string} [props.title] - Main title text
 * @param {string} props.message - Message to display
 * @param {Object} [props.action] - Optional action button
 * @param {string} props.action.text - Button text
 * @param {string} props.action.to - Link destination
 * @param {string} [props.className] - Additional CSS classes
 */
function EmptyState({ icon, title, message, action, className = "" }) {
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
