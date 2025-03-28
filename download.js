// Download configuration for different versions
const downloadConfig = {
  commonEntrancePaid: {
    apkPath: "Pry.apk",
    paymentRequired: true,
    paymentLink: "https://binapayment.vercel.app",
  },
  jss3: {
    apkPath: "Jss.apk",
    paymentRequired: true,
    paymentLink: "https://binapayment.vercel.app",
  },
  ss3: {
    apkPath: "Sss.apk",
    paymentRequired: true,
    paymentLink: "https://binapayment.vercel.app",
  },
};

let currentSelectedVersion = null;

function openDownloadPopup(version) {
  // Store the current selected version
  currentSelectedVersion = version;

  // Get the popup and message elements
  const popup = document.getElementById("downloadPopup");
  const popupMessage = document.getElementById("popupMessage");

  // Configure popup based on version
  const config = downloadConfig[version];

  if (config.paymentRequired) {
    popupMessage.textContent =
      "Have you completed the payment for the personalized profile to access this exam version?";
  } else {
    popupMessage.textContent = "Ready to download the free version of BINA?";
  }

  // Display the popup
  popup.style.display = "flex";
}

function continueToPayment() {
  if (!currentSelectedVersion) return;

  const config = downloadConfig[currentSelectedVersion];
  if (config.paymentLink) {
    window.location.href = config.paymentLink;
  } else {
    alert("No payment link available for this version.");
  }

  // Close the popup
  document.getElementById("downloadPopup").style.display = "none";
}
// Exit

function proceedToDownload() {
  if (!currentSelectedVersion) return;

  const config = downloadConfig[currentSelectedVersion];

  // Close the popup
  document.getElementById("downloadPopup").style.display = "none";

  // Trigger APK download
  const link = document.createElement("a");
  link.href = config.apkPath;
  link.download = `BINA-${currentSelectedVersion}.apk`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Optional: Add error handling for download failures
function handleDownloadError(error) {
  console.error("Download failed:", error);
  alert("Sorry, the download could not be completed. Please try again later.");
}
function closeDownloadPopup() {
  document.getElementById("downloadPopup").style.display = "none";
  currentSelectedVersion = null; // Reset the selected version
}

// Optionally, add ability to close popup with Escape key
document.addEventListener("keydown", function (event) {
  if (event.key === "Escape") {
    closeDownloadPopup();
  }
});
