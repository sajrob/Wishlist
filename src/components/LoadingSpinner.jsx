/**
 * Loading spinner component for consistent loading states
 * Can be used as a full-page loader or inline
 * 
 * @param {Object} props
 * @param {string} [props.message] - Optional loading message to display
 * @param {boolean} [props.inline] - Whether to display inline (default: false, full-page)
 * @param {string} [props.className] - Additional CSS classes
 */
function LoadingSpinner({ message = "Loading...", inline = false, className = "" }) {
    if (inline) {
        return (
            <div className={`loading-spinner ${className}`.trim()}>
                {message}
            </div>
        );
    }

    return (
        <div className={`loading ${className}`.trim()}>
            {message}
        </div>
    );
}

export default LoadingSpinner;
