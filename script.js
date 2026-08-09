document.addEventListener('DOMContentLoaded', function() {
    // Flecha de "volver" (solo existe en las páginas de proyecto). Si venimos
    // de este mismo sitio, usamos el historial nativo del navegador: recupera
    // la posición de scroll exacta que tenías en la grid. Si no hay historial
    // válido (enlace directo, pestaña nueva...), se usa el enlace normal de
    // fallback a index.html#projects.
    const backArrow = document.getElementById('backArrow');
    if (backArrow) {
        backArrow.addEventListener('click', function(e) {
            const cameFromSite = document.referrer && document.referrer.indexOf(window.location.host) !== -1;
            if (cameFromSite && window.history.length > 1) {
                e.preventDefault();
                window.history.back();
            }
        });
    }

    const lightbox = document.getElementById('lightbox');
    if (lightbox) {
        const galleryItems = Array.from(document.querySelectorAll('.project-gallery img, .project-gallery video, .logo-item img'));
        const lightboxContent = document.getElementById('lightbox-content');
        const lightboxClose = document.getElementById('lightbox-close');
        const lightboxPrev = document.getElementById('lightboxPrev');
        const lightboxNext = document.getElementById('lightboxNext');
        let currentIndex = 0;

        var showLightboxItem = function(index) {
            if (galleryItems.length === 0) return;
            currentIndex = (index + galleryItems.length) % galleryItems.length;
            const item = galleryItems[currentIndex];

            lightboxContent.innerHTML = '';
            const clone = item.cloneNode(true);

            if (clone.tagName === 'VIDEO') {
                clone.removeAttribute('muted');
                clone.setAttribute('controls', '');
                clone.play();
            }

            lightboxContent.appendChild(clone);
        };

        galleryItems.forEach(function(item, index) {
            item.addEventListener('click', function() {
                showLightboxItem(index);
                lightbox.classList.add('active');
            });
        });

        var closeLightbox = function() {
            lightbox.classList.remove('active');
            lightboxContent.innerHTML = '';
        };

        lightboxClose.addEventListener('click', closeLightbox);
        lightbox.addEventListener('click', function(e) {
            if (e.target === lightbox) {
                closeLightbox();
            }
        });

        if (lightboxPrev) {
            lightboxPrev.addEventListener('click', function() {
                showLightboxItem(currentIndex - 1);
            });
        }
        if (lightboxNext) {
            lightboxNext.addEventListener('click', function() {
                showLightboxItem(currentIndex + 1);
            });
        }

        document.addEventListener('keydown', function(e) {
            if (!lightbox.classList.contains('active')) return;
            if (e.key === 'ArrowLeft') showLightboxItem(currentIndex - 1);
            if (e.key === 'ArrowRight') showLightboxItem(currentIndex + 1);
            if (e.key === 'Escape') closeLightbox();
        });
    }

    // Formulario de contacto: envío por AJAX (fetch) a Formspree, sin
    // recargar la página. Necesita que "action" en el <form> apunte a tu
    // endpoint real de Formspree (ver instrucciones aparte).
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const status = document.getElementById('formStatus');
            const button = contactForm.querySelector('.btn-submit');
            const data = new FormData(contactForm);

            button.disabled = true;
            button.textContent = 'ENVIANDO...';
            status.textContent = '';
            status.className = 'form-status';

            fetch(contactForm.action, {
                method: 'POST',
                body: data,
                headers: { 'Accept': 'application/json' }
            })
                .then(function(response) {
                    if (response.ok) {
                        status.textContent = 'Gracias, tu mensaje se ha enviado correctamente.';
                        status.classList.add('success');
                        contactForm.reset();
                    } else {
                        status.textContent = 'Ha ocurrido un error. Escríbeme directamente a hidalgocarrasco@gmail.com.';
                        status.classList.add('error');
                    }
                })
                .catch(function() {
                    status.textContent = 'Ha ocurrido un error. Escríbeme directamente a hidalgocarrasco@gmail.com.';
                    status.classList.add('error');
                })
                .finally(function() {
                    button.disabled = false;
                    button.textContent = 'ENVIAR';
                });
        });
    }
});