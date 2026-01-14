/**
 * LoadingSpinner component that displays a rotating indicator during data fetching or processing.
 * Supports inline and full-page styles with a customizable message.
 */
interface LoadingSpinnerProps {
    message?: string;
    inline?: boolean;
    className?: string;
}

function LoadingSpinner({ message = 'Loading...', inline = false, className = '' }: LoadingSpinnerProps) {
    if (inline) {
        return <div className={`loading-spinner ${className}`.trim()}>{message}</div>;
    }

    return <div className={`loading ${className}`.trim()}>{message}</div>;
}

export default LoadingSpinner;


