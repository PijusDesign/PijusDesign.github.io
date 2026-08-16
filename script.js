// ---------- TRANSICIÓN ENTRE PÁGINAS ----------

// Evitar que las imágenes se puedan arrastrar con el ratón
document.addEventListener('dragstart', function(e) {
    if (e.target.tagName === 'IMG') {
        e.preventDefault();
    }
});

window.addEventListener('pageshow', function() {
    document.body.classList.add('page-transition-in');
    document.body.classList.remove('page-transition-out');
});

document.addEventListener('click', function(e) {
    const link = e.target.closest('a');

    if (!link) return;

    const href = link.getAttribute('href');

    // Ignorar enlaces que no cambian de página
    if (
        !href ||
        href.startsWith('#') ||
        href.startsWith('mailto:') ||
        href.startsWith('tel:') ||
        link.target === '_blank' ||
        link.hasAttribute('download')
    ) {
        return;
    }

    const url = new URL(link.href, window.location.href);

    // Ignorar enlaces externos
    if (url.origin !== window.location.origin) return;


    // =====================================================
    // MISMO APARTADO / MISMA PÁGINA
    // =====================================================

    if (url.pathname === window.location.pathname) {

        e.preventDefault();

        // Comenzar fade-out de toda la página
        document.body.classList.remove('page-transition-in');
        document.body.classList.add('page-transition-out');

        // Esperar a que el fade-out haya terminado
        setTimeout(function() {

            const projectsGrid = document.querySelector('.projects-grid');

            // Si estamos en el index, preparar de nuevo los proyectos
            if (projectsGrid) {
                document.body.classList.remove('page-loaded');
            }

            // Forzar al navegador a registrar el estado inicial
            void document.body.offsetWidth;

            // Volver a mostrar la página
            document.body.classList.remove('page-transition-out');

            requestAnimationFrame(function() {

                document.body.classList.add('page-transition-in');

                // Una vez iniciado el fade-in,
                // lanzar la animación escalonada del grid
                if (projectsGrid) {

                    requestAnimationFrame(function() {
                        document.body.classList.add('page-loaded');
                    });

                }

            });

        }, 200);

        return;
    }


    // =====================================================
    // CAMBIO A OTRA PÁGINA
    // =====================================================

    e.preventDefault();

    // Guardar posición actual del isotipo
    const logoVideo = document.querySelector('header video');

    if (logoVideo) {
        sessionStorage.setItem(
            'logoVideoTime',
            logoVideo.currentTime
        );
    }

    // Comenzar fade-out
    document.body.classList.remove('page-transition-in');
    document.body.classList.add('page-transition-out');

    setTimeout(function() {
        window.location.href = link.href;
    }, 200);
});


// ---------- DOM READY ----------

document.addEventListener('DOMContentLoaded', function() {


    // =====================================================
    // MENÚ HAMBURGUESA
    // =====================================================

    const navToggle = document.getElementById('navToggle');
    const headerRight = document.querySelector('.header-right');

    if (navToggle && headerRight) {

        navToggle.addEventListener('click', function() {
            const isOpen = document.body.classList.toggle('nav-open');
            navToggle.setAttribute('aria-expanded', isOpen);
        });

        // Cerrar al pulsar un enlace del menú
        headerRight.querySelectorAll('a').forEach(function(link) {
            link.addEventListener('click', function() {
                document.body.classList.remove('nav-open');
                navToggle.setAttribute('aria-expanded', 'false');
            });
        });

        // Cerrar al pulsar fuera del panel
        document.addEventListener('click', function(e) {
            if (!document.body.classList.contains('nav-open')) return;
            if (e.target.closest('.header-right') || e.target.closest('#navToggle')) return;
            document.body.classList.remove('nav-open');
            navToggle.setAttribute('aria-expanded', 'false');
        });

    }


    // =====================================================
    // ISOTIPO CONTINUO ENTRE PÁGINAS
    // =====================================================

    const logoVideo = document.querySelector('header video');

    if (logoVideo) {

        const savedTime =
            sessionStorage.getItem('logoVideoTime');

        if (savedTime !== null) {

            const restoreLogoPosition = function() {

                try {
                    logoVideo.currentTime =
                        parseFloat(savedTime);
                } catch (error) {
                    // El vídeo todavía no permite cambiar currentTime
                }

            };

            // Si ya conocemos la duración, restaurar inmediatamente
            if (logoVideo.readyState >= 1) {
                restoreLogoPosition();
            } else {
                logoVideo.addEventListener(
                    'loadedmetadata',
                    restoreLogoPosition,
                    { once: true }
                );
            }

        }

        // Guardar continuamente la posición del vídeo
        logoVideo.addEventListener('timeupdate', function() {

            sessionStorage.setItem(
                'logoVideoTime',
                logoVideo.currentTime
            );

        });

    }


    // ---------- FLECHA ATRÁS ----------

    const backArrow = document.getElementById('backArrow');

    if (backArrow) {

        backArrow.addEventListener('click', function(e) {

            const cameFromSite =
                document.referrer &&
                document.referrer.indexOf(window.location.host) !== -1;

            // Si venimos de nuestro propio index,
            // usar el historial para conservar la posición de scroll
            if (
                cameFromSite &&
                window.history.length > 1
            ) {

                e.preventDefault();

                // Guardar posición del isotipo
                const logoVideo =
                    document.querySelector('header video');

                if (logoVideo) {

                    sessionStorage.setItem(
                        'logoVideoTime',
                        logoVideo.currentTime
                    );

                }

                // Comenzar fade-out
                document.body.classList.remove(
                    'page-transition-in'
                );

                document.body.classList.add(
                    'page-transition-out'
                );

                setTimeout(function() {

                    window.history.back();

                }, 200);

            }

        });

    }


    // ---------- ANIMACIÓN DE ENTRADA ----------

    requestAnimationFrame(function() {
        document.body.classList.add('page-loaded');
    });


    // ---------- VOLVER ARRIBA ----------

    const backToTop =
        document.getElementById('backToTop');

    if (backToTop) {

        window.addEventListener('scroll', function() {

            if (window.scrollY > Math.min(window.innerHeight * 0.5, 450)) {

                backToTop.classList.add('visible');

            } else {

                backToTop.classList.remove('visible');

            }

        });


        backToTop.addEventListener('click', function(e) {

            e.preventDefault();

            const startPosition = window.scrollY;
            const startTime = performance.now();
            const duration = 900;

            function scrollToTop(currentTime) {

                const elapsed =
                    currentTime - startTime;

                const progress =
                    Math.min(
                        elapsed / duration,
                        1
                    );

                // Empieza con velocidad normal
                // y acelera suavemente
                const easedProgress =
                    progress *
                    progress *
                    (3 - progress);

                window.scrollTo(
                    0,
                    startPosition *
                    (1 - easedProgress)
                );

                if (progress < 1) {
                    requestAnimationFrame(
                        scrollToTop
                    );
                }

            }

            requestAnimationFrame(
                scrollToTop
            );

        });

    }


    // ---------- LIGHTBOX ----------

    const lightbox =
        document.getElementById('lightbox');

    if (lightbox) {

        const galleryItems = Array.from(
            document.querySelectorAll(
                '.project-gallery img, .project-gallery video'
            )
        );

        const lightboxContent =
            document.getElementById(
                'lightbox-content'
            );

        const lightboxClose =
            document.getElementById(
                'lightbox-close'
            );

        const lightboxPrev =
            document.getElementById(
                'lightboxPrev'
            );

        const lightboxNext =
            document.getElementById(
                'lightboxNext'
            );

        let currentIndex = 0;


        var showLightboxItem =
            function(index) {

                if (galleryItems.length === 0) {
                    return;
                }

                currentIndex =
                    (index + galleryItems.length) %
                    galleryItems.length;

                const item =
                    galleryItems[currentIndex];

                lightboxContent.innerHTML = '';

                const clone =
                    item.cloneNode(true);

                if (clone.tagName === 'VIDEO') {

                    clone.removeAttribute('muted');

                    clone.setAttribute(
                        'controls',
                        ''
                    );

                    clone.play();

                }

                lightboxContent.appendChild(
                    clone
                );

            };


        galleryItems.forEach(
            function(item, index) {

                item.addEventListener(
                    'click',
                    function() {

                        showLightboxItem(index);

                        lightbox.classList.add(
                            'active'
                        );

                    }
                );

            }
        );


        var closeLightbox =
            function() {

                lightbox.classList.remove(
                    'active'
                );

                lightboxContent.innerHTML = '';

            };


        lightboxClose.addEventListener(
            'click',
            closeLightbox
        );


        lightbox.addEventListener(
            'click',
            function(e) {

                if (e.target === lightbox) {
                    closeLightbox();
                }

            }
        );


        if (lightboxPrev) {

            lightboxPrev.addEventListener(
                'click',
                function() {

                    showLightboxItem(
                        currentIndex - 1
                    );

                }
            );

        }


        if (lightboxNext) {

            lightboxNext.addEventListener(
                'click',
                function() {

                    showLightboxItem(
                        currentIndex + 1
                    );

                }
            );

        }


        document.addEventListener(
            'keydown',
            function(e) {

                if (
                    !lightbox.classList.contains(
                        'active'
                    )
                ) {
                    return;
                }

                if (e.key === 'ArrowLeft') {

                    showLightboxItem(
                        currentIndex - 1
                    );

                }

                if (e.key === 'ArrowRight') {

                    showLightboxItem(
                        currentIndex + 1
                    );

                }

                if (e.key === 'Escape') {

                    closeLightbox();

                }

            }
        );

    }


    // ---------- FORMULARIO DE CONTACTO ----------

    const contactForm =
        document.getElementById(
            'contactForm'
        );

    if (contactForm) {

        contactForm.addEventListener(
            'submit',
            function(e) {

                e.preventDefault();

                const status =
                    document.getElementById(
                        'formStatus'
                    );

                const button =
                    contactForm.querySelector(
                        '.btn-submit'
                    );

                const data =
                    new FormData(
                        contactForm
                    );


                button.disabled = true;

                button.textContent =
                    'ENVIANDO...';

                status.textContent = '';

                status.className =
                    'form-status';


                fetch(
                    contactForm.action,
                    {
                        method: 'POST',
                        body: data,
                        headers: {
                            'Accept':
                                'application/json'
                        }
                    }
                )

                .then(function(response) {

                    if (response.ok) {

                        status.textContent =
                            'Gracias, tu mensaje se ha enviado correctamente.';

                        status.classList.add(
                            'success'
                        );

                        contactForm.reset();

                    } else {

                        status.textContent =
                            'Ha ocurrido un error. Escríbeme directamente a hidalgocarrasco@gmail.com.';

                        status.classList.add(
                            'error'
                        );

                    }

                })

                .catch(function() {

                    status.textContent =
                        'Ha ocurrido un error. Escríbeme directamente a hidalgocarrasco@gmail.com.';

                    status.classList.add(
                        'error'
                    );

                })

                .finally(function() {

                    button.disabled = false;

                    button.textContent =
                        'ENVIAR';

                });

            }
        );

    }

});

    // ---------- COLOCA LOS PROYECTOS MÁS NUEVOS ARRIBA ----------

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.projects-grid').forEach(grid => {
        Array.from(grid.children).reverse().forEach(child => grid.appendChild(child));
    });
});