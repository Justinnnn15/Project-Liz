let row1Position = 0;
let row2Position = 0;
const scrollSpeed = 0.45;

function initLoader() {
    const loader = document.querySelector('.loader-wrapper');
    const particles = document.getElementById('particles');
    const answerInput = document.getElementById('beautyAnswer');
    const answerHint = document.getElementById('answerHint');
    const loadingBar = document.getElementById('loadingBar');
    const loadingText = document.getElementById('loadingText');
    
    // Create particles
    for (let i = 0; i < 30; i++) {
        const particle = document.createElement('div');
        particle.classList.add('particle');
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 3 + 's';
        particle.style.animationDuration = (Math.random() * 2 + 2) + 's';
        particles.appendChild(particle);
    }
    
    // Focus on input
    setTimeout(() => {
        answerInput.focus();
    }, 500);
    
    // Check answer on input
    answerInput.addEventListener('input', function(e) {
        const answer = e.target.value.toUpperCase();
        
        if (answer === 'LIZ') {
            // Correct answer
            answerHint.textContent = '✨ Correct! Loading...';
            answerHint.style.color = '#4ade80';
            answerInput.disabled = true;
            answerInput.style.borderColor = '#4ade80';
            answerInput.style.backgroundColor = 'rgba(74, 222, 128, 0.2)';
            
            // Hide question and input, show loading bar
            setTimeout(() => {
                answerInput.style.display = 'none';
                answerHint.style.display = 'none';
                document.querySelector('.loader-question').style.display = 'none';
                loadingBar.style.display = 'block';
                loadingText.style.display = 'block';
                
                // Hide loader after animation
                setTimeout(() => {
                    loader.classList.add('hidden');
                    document.body.style.overflow = 'auto';
                    triggerHeroAnimation();
                }, 2500);
            }, 1000);
            
        } else if (answer.length === 3) {
            // Wrong answer
            answerHint.textContent = '❌ Wrong! Try again...';
            answerHint.style.color = '#ff6b6b';
            answerInput.value = '';
            answerInput.style.animation = 'shake 0.5s ease';
            setTimeout(() => {
                answerInput.style.animation = '';
            }, 500);
        } else {
            answerHint.textContent = '';
        }
    });
}

function triggerHeroAnimation() {
    // Scroll to top immediately
    window.scrollTo({
        top: 0,
        behavior: 'instant'
    });
    
    const body = document.getElementById('body');
    if (body) {
        body.style.opacity = '0';
        setTimeout(() => {
            body.style.transition = 'opacity 1.2s ease';
            body.style.opacity = '1';
        }, 100);
    }
}

function createXOXZPattern() {
    const body = document.getElementById('body');
    if (!body) return;
    
    const patternContainer = document.createElement('div');
    patternContainer.className = 'xoxz-pattern';
    
    // Create 5 rows of XOXZ text
    for (let i = 0; i < 5; i++) {
        const textElement = document.createElement('div');
        textElement.className = 'xoxz-text';
        
        // Alternate between filled and outline
        if (i % 2 === 0) {
            textElement.classList.add('xoxz-filled');
        } else {
            textElement.classList.add('xoxz-outline');
        }
        
        textElement.textContent = 'XOXZ';
        patternContainer.appendChild(textElement);
    }
    
    body.insertBefore(patternContainer, body.firstChild);
    
    // Add transparent overlay between XOXZ and content
    const overlay = document.createElement('div');
    overlay.className = 'transparent-overlay';
    body.appendChild(overlay);
}

function setupStickyHeader() {
    const header = document.getElementById('header');
    let lastScroll = 0;
    
    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        
        if (currentScroll > 100) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
        
        if (currentScroll > lastScroll && currentScroll > 200) {
            header.style.transform = 'translateY(-100%)';
        } else {
            header.style.transform = 'translateY(0)';
        }
        
        lastScroll = currentScroll;
    });
}

function setupVideoAutoplay() {
    const videos = document.querySelectorAll('video');
    
    // Set up Intersection Observer to pause off-screen videos
    const videoObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const video = entry.target;
            if (video.id === 'soloVideo') return; // Skip solo video
            
            if (entry.isIntersecting) {
                // Video is visible, play it (with delay to prevent all playing at once)
                requestAnimationFrame(() => {
                    if (video.paused && video.readyState >= 2) {
                        video.play().catch(() => {});
                    }
                });
            } else {
                // Video is off-screen, pause immediately and clear buffer
                if (!video.paused) {
                    video.pause();
                    // Reduce memory by seeking to start
                    video.currentTime = 0;
                }
            }
        });
    }, {
        threshold: 0.05, // More sensitive - pause sooner when leaving viewport
        rootMargin: '0px' // No margin - only play when actually visible
    });
    
    videos.forEach((video, index) => {
        // Skip the solo performance video - let user control it
        if (video.id === 'soloVideo') {
            return;
        }
        
        // Ensure all necessary attributes are set for performance
        video.muted = true;
        video.loop = true;
        video.playsInline = true;
        video.defaultMuted = true;
        video.setAttribute('playsinline', '');
        video.setAttribute('webkit-playsinline', '');
        
        // Reduce video quality for better performance
        video.style.willChange = 'auto'; // Don't force GPU layer
        
        // Observe video for visibility
        videoObserver.observe(video);
        
        // Only load video when it's actually needed
        let hasLoaded = false;
        const loadAndPlay = () => {
            if (!hasLoaded) {
                video.load();
                hasLoaded = true;
            }
            const playPromise = video.play();
            if (playPromise !== undefined) {
                playPromise.catch(() => {
                    // Silently fail, will retry when visible
                });
            }
        };
        
        // Don't auto-play initially, let Intersection Observer handle it
        const rect = video.getBoundingClientRect();
        const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
        if (isVisible) {
            loadAndPlay();
        }
        
        // Handle errors gracefully
        video.addEventListener('error', function() {
            console.warn('Video failed to load, skipping:', video.src);
        });
        
        // Prevent auto-resume for better performance
        video.addEventListener('pause', function() {
            // Let Intersection Observer handle play/pause
        });
        
        // Only play when ready and visible
        video.addEventListener('canplay', function() {
            const rect = video.getBoundingClientRect();
            const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
            if (isVisible && video.paused && !hasLoaded) {
                hasLoaded = true;
                video.play().catch(() => {});
            }
        });
    });
}

function createAdvancedCursor() {
    const cursor = document.createElement('div');
    cursor.classList.add('custom-cursor');
    document.body.appendChild(cursor);
    
    const cursorFollower = document.createElement('div');
    cursorFollower.classList.add('cursor-follower');
    document.body.appendChild(cursorFollower);
    
    const cursorGlow = document.createElement('div');
    cursorGlow.classList.add('cursor-glow');
    document.body.appendChild(cursorGlow);
    
    let mouseX = 0, mouseY = 0;
    let followerX = 0, followerY = 0;
    let glowX = 0, glowY = 0;
    
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        cursor.style.left = mouseX + 'px';
        cursor.style.top = mouseY + 'px';
    });
    
    function animateFollowers() {
        followerX += (mouseX - followerX) * 0.15;
        followerY += (mouseY - followerY) * 0.15;
        cursorFollower.style.left = followerX + 'px';
        cursorFollower.style.top = followerY + 'px';
        
        glowX += (mouseX - glowX) * 0.05;
        glowY += (mouseY - glowY) * 0.05;
        cursorGlow.style.left = glowX + 'px';
        cursorGlow.style.top = glowY + 'px';
        
        requestAnimationFrame(animateFollowers);
    }
    animateFollowers();
    
    const interactiveElements = document.querySelectorAll('.lizPic, video, .button, #wife, a');
    interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursor.style.transform = 'translate(-50%, -50%) scale(2)';
            cursorFollower.style.transform = 'translate(-50%, -50%) scale(2)';
            cursor.style.backgroundColor = '#ff1493';
            cursorFollower.style.borderColor = '#ff1493';
        });
        el.addEventListener('mouseleave', () => {
            cursor.style.transform = 'translate(-50%, -50%) scale(1)';
            cursorFollower.style.transform = 'translate(-50%, -50%) scale(1)';
            cursor.style.backgroundColor = '#ff69b4';
            cursorFollower.style.borderColor = '#ff69b4';
        });
    });
    
    document.addEventListener('mousedown', () => {
        cursor.style.transform = 'translate(-50%, -50%) scale(0.8)';
        cursorFollower.style.transform = 'translate(-50%, -50%) scale(0.8)';
    });
    
    document.addEventListener('mouseup', () => {
        cursor.style.transform = 'translate(-50%, -50%) scale(1)';
        cursorFollower.style.transform = 'translate(-50%, -50%) scale(1)';
    });
}

function setupAdvancedScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0) scale(1) rotateX(0deg)';
                }, index * 100);
            }
        });
    }, observerOptions);
    
    const elements = document.querySelectorAll('.lizPic, video');
    elements.forEach((el) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(80px) scale(0.9) rotateX(10deg)';
        el.style.transition = 'all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)';
        observer.observe(el);
    });
}

function addMultiLayerParallax() {
    let ticking = false;
    
    document.addEventListener('mousemove', (e) => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                const moveX = (e.clientX - window.innerWidth / 2) * 0.02;
                const moveY = (e.clientY - window.innerHeight / 2) * 0.02;
                
                const wife = document.getElementById('wife');
                if (wife) {
                    wife.style.transform = `translate(${moveX}px, ${moveY}px) scale(1)`;
                }
                
                const message = document.getElementById('message');
                if (message) {
                    message.style.transform = `translate(${moveX * 0.5}px, ${moveY * 0.5}px)`;
                }
                
                ticking = false;
            });
            ticking = true;
        }
    });
    
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const parallaxElements = document.querySelectorAll('#wife, #message');
        
        parallaxElements.forEach((el, index) => {
            const speed = 0.5 + (index * 0.2);
            el.style.transform = `translateY(${scrolled * speed}px)`;
        });
    });
}

function createRippleEffect() {
    const button = document.querySelector('.button');
    
    if (button) {
        button.addEventListener('click', function(e) {
            const ripple = document.createElement('span');
            ripple.classList.add('ripple');
            
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            
            this.appendChild(ripple);
            
            setTimeout(() => ripple.remove(), 600);
        });
    }
}

function setupSmoothPageTransitions() {
    const body = document.getElementById('body');
    const content = document.getElementById('content');
    
    const transitionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.2 });
    
    if (content) {
        content.style.opacity = '0';
        content.style.transform = 'translateY(100px)';
        content.style.transition = 'all 1s ease';
        transitionObserver.observe(content);
    }
}

function addImageRevealEffect() {
    const images = document.querySelectorAll('.lizPic, #wife');
    
    images.forEach((img, index) => {
        const wrapper = document.createElement('div');
        wrapper.className = 'reveal-wrapper';
        img.parentNode.insertBefore(wrapper, img);
        wrapper.appendChild(img);
        
        const overlay = document.createElement('div');
        overlay.className = 'reveal-overlay';
        wrapper.appendChild(overlay);
        
        setTimeout(() => {
            overlay.style.transform = 'translateX(100%)';
        }, 1000 + (index * 150));
    });
}

function setupVerticalScroll() {
    const columns = document.querySelectorAll('.gallery-column');
    
    columns.forEach(column => {
        // Clone the content of each column for infinite scrolling
        const images = Array.from(column.children);
        images.forEach(img => {
            const clone = img.cloneNode(true);
            column.appendChild(clone);
        });
    });
}

function setupVideoGallery() {
    const videoCards = document.querySelectorAll('.video-card');
    const videoGrid = document.getElementById('videoGalleryGrid');
    
    if (!videoGrid) return;
    
    // Track which videos are currently allowed to play
    let activeRowVideos = new Set();
    const loadedVideos = new Set();
    
    // Calculate grid layout (columns per row)
    const getColumnsPerRow = () => {
        const gridStyle = window.getComputedStyle(videoGrid);
        const gridTemplateColumns = gridStyle.gridTemplateColumns;
        return gridTemplateColumns.split(' ').length;
    };
    
    // Get row number for a video card
    const getVideoRow = (index) => {
        const columnsPerRow = getColumnsPerRow();
        return Math.floor(index / columnsPerRow);
    };
    
    // Load video on demand
    const loadVideo = (video, source) => {
        if (source && source.dataset.src && !source.src) {
            source.src = source.dataset.src;
            video.load();
        }
    };
    
    // Determine which row is most visible
    const updateActiveRow = () => {
        const columnsPerRow = getColumnsPerRow();
        const viewportHeight = window.innerHeight;
        const viewportCenter = viewportHeight / 2;
        
        let closestRow = -1;
        let closestDistance = Infinity;
        
        // Group cards by row and find which row is closest to viewport center
        const rowCards = new Map();
        videoCards.forEach((card, index) => {
            const row = getVideoRow(index);
            if (!rowCards.has(row)) {
                rowCards.set(row, []);
            }
            rowCards.get(row).push({ card, index });
        });
        
        // Find the row closest to viewport center
        rowCards.forEach((cards, rowNumber) => {
            const firstCard = cards[0].card;
            const rect = firstCard.getBoundingClientRect();
            const cardCenter = rect.top + (rect.height / 2);
            const distance = Math.abs(cardCenter - viewportCenter);
            
            if (distance < closestDistance) {
                closestDistance = distance;
                closestRow = rowNumber;
            }
        });
        
        // Update active videos set
        const newActiveVideos = new Set();
        if (closestRow >= 0 && rowCards.has(closestRow)) {
            rowCards.get(closestRow).forEach(({ index }) => {
                newActiveVideos.add(index);
            });
        }
        
        // Pause videos that are no longer in the active row
        activeRowVideos.forEach(index => {
            if (!newActiveVideos.has(index)) {
                const card = videoCards[index];
                const video = card.querySelector('.gallery-video');
                if (!video.paused) {
                    video.pause();
                    video.currentTime = 0;
                }
            }
        });
        
        // Play videos in the new active row
        newActiveVideos.forEach(index => {
            const card = videoCards[index];
            const video = card.querySelector('.gallery-video');
            const source = video.querySelector('source');
            
            // Load video if not loaded yet
            if (!loadedVideos.has(index)) {
                loadVideo(video, source);
                loadedVideos.add(index);
            }
            
            // Auto-play if ready (video already loaded)
            if (video.readyState >= 2 && video.paused) {
                video.play().catch(err => console.log('Video play failed:', err));
            }
        });
        
        activeRowVideos = newActiveVideos;
    };
    
    // Observe video gallery page scroll
    let scrollTimeout;
    const videoGalleryPage = document.getElementById('videoGalleryPage');
    
    const pageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Page is visible, start checking for active row
                setTimeout(() => {
                    updateActiveRow();
                    window.addEventListener('scroll', handleScroll);
                }, 100);
            } else {
                // Page is not visible, pause all videos
                videoCards.forEach(card => {
                    const video = card.querySelector('.gallery-video');
                    if (!video.paused) {
                        video.pause();
                        video.currentTime = 0;
                    }
                });
                window.removeEventListener('scroll', handleScroll);
                activeRowVideos.clear();
            }
        });
    }, { threshold: 0.2 });
    
    const handleScroll = () => {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(updateActiveRow, 100);
    };
    
    if (videoGalleryPage) {
        pageObserver.observe(videoGalleryPage);
    }
    
    videoCards.forEach((card, index) => {
        const video = card.querySelector('.gallery-video');
        const muteBtn = card.querySelector('.mute-btn');
        const source = video.querySelector('source');
        
        // Mark card as loaded when video metadata loads
        video.addEventListener('loadedmetadata', () => {
            card.classList.add('loaded');
        });
        
        // Handle video load errors
        video.addEventListener('error', () => {
            console.error(`Video ${index + 1} failed to load`);
            card.style.background = 'linear-gradient(135deg, rgba(255, 0, 0, 0.1) 0%, rgba(150, 0, 0, 0.1) 100%)';
            card.classList.add('loaded');
        });
        
        // Mute/Unmute button functionality
        if (muteBtn) {
            muteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                
                if (video.muted) {
                    video.muted = false;
                    muteBtn.textContent = '🔊';
                    muteBtn.setAttribute('aria-label', 'Mute video');
                } else {
                    video.muted = true;
                    muteBtn.textContent = '🔇';
                    muteBtn.setAttribute('aria-label', 'Unmute video');
                }
            });
        }
        
        // Play on hover (only if in active row)
        card.addEventListener('mouseenter', () => {
            if (activeRowVideos.has(index) && video && video.paused && video.readyState >= 2) {
                video.play().catch(err => console.log('Video play failed:', err));
            }
        });
        
        // Pause on leave
        card.addEventListener('mouseleave', () => {
            if (video && !video.paused) {
                video.pause();
                video.currentTime = 0;
            }
        });
        
        // Toggle play/pause on click (only if in active row)
        card.addEventListener('click', (e) => {
            // Don't trigger if clicking mute button
            if (e.target.classList.contains('mute-btn')) return;
            
            if (activeRowVideos.has(index)) {
                if (video.paused) {
                    video.play().catch(err => console.log('Video play failed:', err));
                    card.classList.add('playing');
                } else {
                    video.pause();
                    card.classList.remove('playing');
                }
            }
        });
        
        // Update playing class when video ends
        video.addEventListener('ended', () => {
            card.classList.remove('playing');
            video.currentTime = 0;
        });
        
        // When video can play, auto-play if in active row
        video.addEventListener('canplay', () => {
            card.classList.add('loaded');
            if (activeRowVideos.has(index) && video.paused) {
                video.play().catch(err => console.log('Video play failed:', err));
            }
        });
    });
}

function setupProfileCard() {
    const creatorBtn = document.getElementById('creatorBtn');
    const profileCard = document.getElementById('profileCard');
    const closeProfile = document.getElementById('closeProfile');
    
    if (creatorBtn && profileCard) {
        creatorBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            profileCard.classList.add('show');
            document.body.style.overflow = 'hidden'; // Prevent scrolling when card is open
        });
        
        if (closeProfile) {
            closeProfile.addEventListener('click', function(e) {
                e.stopPropagation();
                profileCard.classList.remove('show');
                document.body.style.overflow = 'auto'; // Re-enable scrolling
            });
        }
        
        // Close when clicking on the backdrop (::after pseudo-element area)
        profileCard.addEventListener('click', function(e) {
            // Only close if clicking the card itself (backdrop), not its content
            if (e.target === profileCard) {
                profileCard.classList.remove('show');
                document.body.style.overflow = 'auto';
            }
        });
        
        // Prevent clicks inside profile card content from closing it
        const profileContent = profileCard.querySelector('.profile-card-content');
        if (profileContent) {
            profileContent.addEventListener('click', function(e) {
                e.stopPropagation();
            });
        }
        
        // Close on Escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && profileCard.classList.contains('show')) {
                profileCard.classList.remove('show');
                document.body.style.overflow = 'auto';
            }
        });
    }
}

function setupSoloPageVideo() {
    const soloPage = document.getElementById('soloPage');
    const soloVideo = document.getElementById('soloVideo');
    
    if (!soloPage || !soloVideo) return;
    
    const soloPageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting && !soloVideo.paused) {
                // User navigated away from solo page, pause the video
                soloVideo.pause();
            }
        });
    }, { threshold: 0.1 });
    
    soloPageObserver.observe(soloPage);
}

function setupPageIndicators() {
    const pages = [
        document.getElementById('body'),
        document.getElementById('content'),
        document.getElementById('videoGalleryPage'),
        document.getElementById('soloPage')
    ];
    const dots = document.querySelectorAll('.page-dot');
    
    let scrollTimeout;
    
    // Update active dot based on scroll position
    function updateActiveDot() {
        const scrollTop = window.scrollY;
        const windowHeight = window.innerHeight;
        
        let currentPage = 0;
        let minDistance = Infinity;
        
        pages.forEach((page, index) => {
            if (page) {
                const rect = page.getBoundingClientRect();
                const pageTop = scrollTop + rect.top;
                
                // Calculate distance from top of viewport to page top
                const distance = Math.abs(rect.top);
                
                // The page closest to the top of viewport (snapped) is active
                if (distance < minDistance) {
                    minDistance = distance;
                    currentPage = index;
                }
            }
        });
        
        dots.forEach((dot, index) => {
            if (index === currentPage) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });
    }
    
    // Click handler for dots
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            if (pages[index]) {
                pages[index].scrollIntoView({ behavior: 'auto', block: 'start' });
            }
        });
    });
    
    // Update on scroll with debounce for better performance
    window.addEventListener('scroll', () => {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(updateActiveDot, 50);
    });
    
    // Initial update
    updateActiveDot();
}

window.addEventListener('load', function() {
    // Check if user wants to skip loader (coming from messages page)
    if (window.location.hash === '#skipLoader') {
        const loader = document.querySelector('.loader-wrapper');
        if (loader) {
            loader.classList.add('hidden');
            document.body.style.overflow = 'auto';
        }
        // Remove the hash from URL
        history.replaceState(null, null, ' ');
        triggerHeroAnimation();
    } else {
        initLoader();
    }
    
    createXOXZPattern();
    setupVerticalScroll();
    setupVideoAutoplay();
    setupVideoGallery();
    setupAdvancedScrollAnimations();
    setupStickyHeader();
    addMultiLayerParallax();
    createRippleEffect();
    setupSmoothPageTransitions();
    setupProfileCard();
    setupPageIndicators();
    setupSoloPageVideo();
});
