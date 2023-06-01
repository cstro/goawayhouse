const hiddenListings = JSON.parse(
  localStorage.getItem("hiddenListings") || "[]"
);

const getByAriaLabel = (label, parent = document) => {
  return parent.querySelector(`[aria-label="${label}"]`);
};

const isListingHidden = (listing) => {
  return hiddenListings.includes(listing.id);
};

const addToHiddenListings = (listing) => {
  hiddenListings.push(listing.id);
  localStorage.setItem("hiddenListings", JSON.stringify(hiddenListings));
};

const removeFromHiddenListings = (listing) => {
  hiddenListings.splice(hiddenListings.indexOf(listing.id), 1);
  localStorage.setItem("hiddenListings", JSON.stringify(hiddenListings));
};

const modifyAllListings = () => {
  try {
    console.log("modifyAllListings()");
    const listings = document.querySelectorAll('[id^="listing_"]');

    listings.forEach((listing) => {
      const hasHideButton = getByAriaLabel("Hide this listing", listing);
      if (!hasHideButton) {
        const saveButton =
          getByAriaLabel("Save this listing to your favourites", listing) ??
          getByAriaLabel("Remove this listing from your favourites", listing);

        const hideButton = saveButton.cloneNode(true);
        hideButton.setAttribute("aria-label", "Hide this listing");
        hideButton.textContent = isListingHidden(listing) ? "Unhide" : "Hide";

        hideButton.addEventListener("click", function () {
          if (isListingHidden(listing)) {
            listing.style.opacity = 1;
            removeFromHiddenListings(listing);
            this.textContent = "Hide";
          } else {
            listing.style.opacity = 0.25;
            addToHiddenListings(listing);
            this.textContent = "Unhide";
          }
        });

        const callButton = getByAriaLabel(
          "Reveal agents telephone number",
          listing
        );
        callButton.insertAdjacentElement("beforebegin", hideButton);
      }

      if (isListingHidden(listing)) {
        listing.style.opacity = 0.25;
      }
    });
  } catch (error) {
    console.error(error);
    console.info("Trying again in 1 second...");
    setTimeout(() => {
      modifyAllListings();
    }, 1000);
  }
};

modifyAllListings();

let previousListingIds = Array.from(
  document.querySelectorAll('[id^="listing_"]')
).map((listing) => listing.id);

const observer = new MutationObserver(function (mutations) {
  const currentListingIds = Array.from(
    document.querySelectorAll('[id^="listing_"]')
  ).map((listing) => listing.id);
  const idsChanged = currentListingIds.some(
    (id) => !previousListingIds.includes(id)
  );

  if (idsChanged) {
    previousListingIds = currentListingIds;
    modifyAllListings();
  }
});

observer.observe(document, { subtree: true, childList: true });
