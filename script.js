document.addEventListener("DOMContentLoaded", () => {
  // Loading animation
  const loader = document.querySelector(".loader-container");

  // Hide loader after page loads
  window.addEventListener("load", () => {
    setTimeout(() => {
      loader.classList.add("loader-hidden");
      // Remove loader completely after transition
      loader.addEventListener("transitionend", () => {
        document.body.removeChild(loader);
      });
    }, 1000); // Show loader for at least 1 second
  });

  // Mobile navigation toggle
  const navToggle = document.querySelector(".nav-toggle");
  const navLinks = document.querySelector(".nav-links");

  navToggle.addEventListener("click", () => {
    navLinks.classList.toggle("active");
  });

  // Close mobile menu when clicking on links
  document.querySelectorAll(".nav-links a").forEach((link) => {
    link.addEventListener("click", () => {
      if (navLinks.classList.contains("active")) {
        navLinks.classList.remove("active");
      }
    });
  });

  // Scroll animations
  const fadeElements = document.querySelectorAll(".fade-in");

  // Initial check for elements already in viewport on page load
  checkFadeElements();

  // Check elements on scroll
  window.addEventListener("scroll", checkFadeElements);

  function checkFadeElements() {
    const triggerBottom = window.innerHeight * 0.8;

    fadeElements.forEach((element) => {
      const elementTop = element.getBoundingClientRect().top;

      if (elementTop < triggerBottom) {
        element.style.animationPlayState = "running";
      }
    });
  }

  // Sticky navbar
  const navbar = document.querySelector(".navbar");
  let lastScrollY = window.scrollY;

  window.addEventListener("scroll", () => {
    if (window.scrollY > 100) {
      navbar.style.background = "#ffffff";
      navbar.style.boxShadow = "0 2px 10px rgba(0, 0, 0, 0.1)";
      navbar.style.padding = "10px 0";
    } else {
      navbar.style.background = "#ffffff";
      navbar.style.boxShadow = "0 4px 6px rgba(0, 0, 0, 0.1)";
      navbar.style.padding = "15px 0";
    }

    // Hide navbar on scroll down, show on scroll up
    if (window.scrollY > lastScrollY) {
      navbar.style.top = "-80px";
    } else {
      navbar.style.top = "0";
    }

    lastScrollY = window.scrollY;
  });

  // Form submission
  const contactForm = document.querySelector(".contact-form");
  const notification = document.querySelector("#form-notification");

  if (contactForm) {
    contactForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      // Get form data
      const formData = new FormData(contactForm);

      try {
        const response = await fetch(
          "https://formsubmit.co/ajax/binativit@gmail.com",
          {
            method: "POST",
            body: formData,
            headers: { Accept: "application/json" },
          }
        );

        if (response.ok) {
          notification.innerHTML = `✅ Thank you! Your message has been sent successfully.`;
          notification.style.display = "block";
          notification.style.background = "#4CAF50"; // Green success color
          contactForm.reset();
        } else {
          throw new Error("Something went wrong, please try again.");
        }
      } catch (error) {
        notification.innerHTML = `❌ Error: ${error.message}`;
        notification.style.display = "block";
        notification.style.background = "#FF5733"; // Red error color
      }

      // Hide notification after 5 seconds
      setTimeout(() => {
        notification.style.display = "none";
      }, 5000);
    });
  }

  // Smooth scroll for navigation links
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();

      const target = document.querySelector(this.getAttribute("href"));

      if (target) {
        window.scrollTo({
          top: target.offsetTop - 80, // Account for navbar height
          behavior: "smooth",
        });
      }
    });
  });

  // Button hover effects for better interactivity
  const buttons = document.querySelectorAll(".btn");

  buttons.forEach((button) => {
    button.addEventListener("mouseenter", () => {
      button.style.transform = "translateY(-3px)";
    });

    button.addEventListener("mouseleave", () => {
      button.style.transform = "translateY(0)";
    });
  });
});
