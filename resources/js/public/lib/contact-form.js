import { getCsrfToken } from './csrf';

/**
 * Progressive enhancement for the contact form: if JS is disabled the
 * <form method="POST"> still works via a normal full navigation (with the
 * @csrf hidden field). When JS runs, the submit is intercepted and sent
 * via fetch with the X-CSRF-TOKEN header so Barba-driven navigations never
 * hit a stale-token 419 error.
 */
export function initContactForm(container) {
    const form = container.querySelector('[data-contact-form]');

    if (!form) {
        return;
    }

    const feedback = form.querySelector('[data-contact-feedback]');
    const submitButton = form.querySelector('[type="submit"]');

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        submitButton?.setAttribute('disabled', 'disabled');
        setFeedback(feedback, '');

        try {
            const response = await fetch(form.action, {
                method: 'POST',
                credentials: 'same-origin',
                headers: {
                    Accept: 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': getCsrfToken(),
                },
                body: new FormData(form),
            });

            if (response.status === 419) {
                setFeedback(feedback, 'Your session expired, please reload the page and try again.', true);
                return;
            }

            if (response.status === 422) {
                const { errors } = await response.json();
                const firstError = Object.values(errors ?? {})[0]?.[0];
                setFeedback(feedback, firstError ?? 'Please check the form fields.', true);
                return;
            }

            if (!response.ok) {
                setFeedback(feedback, 'Something went wrong. Please try again later.', true);
                return;
            }

            form.reset();
            setFeedback(feedback, 'Thanks — your message has been sent.', false);
        } catch (error) {
            setFeedback(feedback, 'Network error. Please try again.', true);
        } finally {
            submitButton?.removeAttribute('disabled');
        }
    });
}

function setFeedback(el, message, isError = false) {
    if (!el) {
        return;
    }

    el.textContent = message;
    el.classList.toggle('text-accent', isError);
}
