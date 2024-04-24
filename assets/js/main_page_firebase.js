import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  getDoc,
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";
const firebaseConfig = {
  apiKey: "AIzaSyANIRaJdxkklcbTPgeFj9LCSrMSzzoNxY4",
  authDomain: "chaitali-dutta-website.firebaseapp.com",
  projectId: "chaitali-dutta-website",
  storageBucket: "chaitali-dutta-website.appspot.com",
  messagingSenderId: "942332299163",
  appId: "1:942332299163:web:29d0e2290217a143dd833e",
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

function applyFilter(filterClass) {
  const cards = document.querySelectorAll(".work__card");
  cards.forEach((card) => {
    if (filterClass === "all") {
      card.style.display = ""; // Resets display to default if 'All' is selected
    } else {
      if (card.classList.contains(filterClass)) {
        card.style.display = "";
      } else {
        card.style.display = "none";
      }
    }
  });

  // Update active class for filters
  document.querySelectorAll(".work__item").forEach((item) => {
    if (
      item.dataset.filter === "." + filterClass ||
      (filterClass === "all" && item.dataset.filter === "all")
    ) {
      item.classList.add("active-work");
    } else {
      item.classList.remove("active-work");
    }
  });
}

async function fetchAndRenderPosts() {
  const postsCollection = collection(db, "posts");
  const querySnapshot = await getDocs(postsCollection);
  const workContainer = document.querySelector(".work__container");
  workContainer.innerHTML = "";

  for (const docSnapshot of querySnapshot.docs.slice(0, 4)) {
    const data = docSnapshot.data();
    let tagClass = "";

    if (data.tags && data.tags.path) {
      const tagRef = doc(db, data.tags.path);
      const tagSnap = await getDoc(tagRef);
      if (tagSnap.exists()) {
        tagClass = tagSnap.data().tag_name.toLowerCase();
      }
    }

    const cardDiv = document.createElement("div");
    cardDiv.className = "work__card mix " + tagClass;

    const cardContent = `
            <img src="${data.photo}" alt="" class="work__img">
        `;
    cardDiv.innerHTML = cardContent;
    workContainer.appendChild(cardDiv);
  }
}

fetchAndRenderPosts();
