import { useCallback, useRef, useState } from 'react';
import { ApiError } from '../api/client.js';

function focusFirstInvalid(errors, formElement) {
  const keys = Object.keys(errors || {}).filter((k) => Boolean(errors[k]));
  if (keys.length === 0) return;

  if (formElement) {
    const controls = Array.from(formElement.querySelectorAll('[name], [id]'));
    for (const el of controls) {
      const key = el.getAttribute('name') || el.getAttribute('id');
      if (key && errors[key] && typeof el.focus === 'function') {
        el.focus();
        return;
      }
    }
  }

  for (const key of keys) {
    const el = document.querySelector(`[name="${CSS.escape(key)}"], #${CSS.escape(key)}`);
    if (el && typeof el.focus === 'function') {
      el.focus();
      return;
    }
  }
}

/**
 * Lightweight form state hook: validates after first submit, maps API 400 field errors,
 * preserves entered values on failure, blocks double submits, and focuses the first invalid control.
 */
export function useForm({ initial = {}, validate, onSubmit }) {
  const [values, setValues] = useState(initial);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const submittingRef = useRef(false);
  const formRef = useRef(null);

  const clearSubmitError = useCallback(() => {
    setSubmitError(null);
  }, []);

  const setFieldValue = useCallback(
    (name, value) => {
      setSubmitError(null);
      setValues((prev) => {
        const next = { ...prev, [name]: value };
        if (submitted) {
          if (typeof validate === 'function') {
            setErrors(validate(next) || {});
          } else {
            setErrors((curr) => {
              if (!curr[name]) return curr;
              const copy = { ...curr };
              delete copy[name];
              return copy;
            });
          }
        }
        return next;
      });
    },
    [submitted, validate],
  );

  const handleChange = useCallback(
    (event) => {
      const target = event.target;
      const name = target.name || target.id;
      if (!name) return;
      let nextVal;
      if (target.type === 'checkbox') {
        nextVal = target.checked;
      } else if (target.type === 'file') {
        nextVal = target.files?.[0] || null;
      } else {
        nextVal = target.value;
      }
      setFieldValue(name, nextVal);
    },
    [setFieldValue],
  );

  const setServerErrors = useCallback((fields = {}) => {
    const clean = fields && typeof fields === 'object' ? { ...fields } : {};
    setErrors(clean);
    focusFirstInvalid(clean, formRef.current);
  }, []);

  const reset = useCallback(
    (nextValues = initial) => {
      setValues(nextValues);
      setErrors({});
      setSubmitError(null);
      setSubmitted(false);
    },
    [initial],
  );

  const handleSubmit = useCallback(
    async (event) => {
      if (event && typeof event.preventDefault === 'function') {
        event.preventDefault();
        formRef.current = event.currentTarget;
      }
      if (submittingRef.current) return;

      setSubmitted(true);
      setSubmitError(null);

      if (typeof validate === 'function') {
        const clientErrors = validate(values) || {};
        if (Object.keys(clientErrors).length > 0) {
          setErrors(clientErrors);
          focusFirstInvalid(clientErrors, formRef.current);
          return;
        }
      }

      setErrors({});
      submittingRef.current = true;
      setSubmitting(true);
      try {
        await onSubmit?.(values, { setServerErrors, reset, setValues });
      } catch (err) {
        if (err instanceof ApiError && err.status === 400 && err.fields && Object.keys(err.fields).length > 0) {
          setServerErrors(err.fields);
        } else {
          setSubmitError(err?.message || 'Đã có lỗi xảy ra, vui lòng thử lại.');
        }
      } finally {
        submittingRef.current = false;
        setSubmitting(false);
      }
    },
    [onSubmit, reset, setServerErrors, validate, values],
  );

  return {
    values,
    errors,
    submitError,
    clearSubmitError,
    submitting,
    submitted,
    setValues,
    setFieldValue,
    handleChange,
    handleSubmit,
    setServerErrors,
    reset,
  };
}
