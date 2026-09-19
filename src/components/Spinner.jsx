
const Spinner = ({ size = 'md', label }) => (
    <span className={`spinner spinner-${size}`} role="status" aria-live="polite">
        <span className="spinner-ring" aria-hidden="true" />
        {label && <span className="spinner-label">{label}</span>}
    </span>
);
 
export default Spinner;