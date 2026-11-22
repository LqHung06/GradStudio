/**
 * Accessible form field with visible <label>, aria-invalid, aria-describedby and inline field error.
 */
export function FormField({
  name,
  label,
  error,
  type = 'text',
  value,
  onChange,
  hint,
  required = false,
  inputProps = {},
  children,
}) {
  const errorId = `${name}-error`;
  const hintId = `${name}-hint`;
  const describedBy = [hint ? hintId : null, error ? errorId : null].filter(Boolean).join(' ') || undefined;

  const controlProps = {
    id: name,
    name,
    'aria-invalid': error ? 'true' : undefined,
    'aria-describedby': describedBy,
  };

  let control;
  if (typeof children === 'function') {
    control = children(controlProps);
  } else if (children) {
    control = children;
  } else if (type === 'textarea') {
    control = (
      <textarea
        {...controlProps}
        value={value ?? ''}
        onChange={onChange}
        {...inputProps}
      />
    );
  } else {
    control = (
      <input
        {...controlProps}
        type={type}
        value={value ?? ''}
        onChange={onChange}
        {...inputProps}
      />
    );
  }

  return (
    <div className={`form-field${error ? ' has-error' : ''}`}>
      <label htmlFor={name}>
        {label}
        {required && <span className="field-required" aria-hidden="true"> *</span>}
      </label>
      {control}
      {hint && (
        <p id={hintId} className="field-hint">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="field-error">
          {error}
        </p>
      )}
    </div>
  );
}
