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

const urlParams = new URLSearchParams(window.location.search);
const postId = urlParams.get("postId");

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

async function fetchAndRenderTags() {
  const tagsCollection = collection(db, "tags");
  const querySnapshot = await getDocs(tagsCollection);
  const filtersContainer = document.querySelector(".work__filters");
  filtersContainer.innerHTML = "";
  const allFilter = document.createElement("span");
  allFilter.className = "work__item active-work"; // 'active-work' indicates the current active filter
  allFilter.textContent = "All";
  allFilter.dataset.filter = "all";
  allFilter.onclick = () => applyFilter("all");
  filtersContainer.appendChild(allFilter);
  querySnapshot.forEach((doc) => {
    const data = doc.data();
    const filterSpan = document.createElement("span");
    filterSpan.className = "work__item";
    filterSpan.textContent = data.tag_name;
    filterSpan.dataset.filter = `.${data.tag_name.toLowerCase()}`;
    filterSpan.onclick = () => applyFilter(data.tag_name.toLowerCase());
    filtersContainer.appendChild(filterSpan);
  });
}

async function fetchAndRenderBlogs() {
  const postsCollection = collection(db, "blog");
  const querySnapshot = await getDocs(postsCollection);
  const workContainer = document.querySelector(".work__container");
  workContainer.innerHTML = "";

  for (const docSnapshot of querySnapshot.docs) {
    const data = docSnapshot.data();
    const id = docSnapshot.id;
    let tagClass = "";
    let photo = "";

    if (data.tags && data.tags.path) {
      const tagRef = doc(db, data.tags.path);
      const tagSnap = await getDoc(tagRef);
      if (tagSnap.exists()) {
        tagClass = tagSnap.data().tag_name.toLowerCase();
      }
    }

    if (data.cover_photo && data.cover_photo.path) {
      const photoRef = doc(db, data.cover_photo.path);
      const photoSnap = await getDoc(photoRef);
      if (photoSnap.exists()) {
        photo = photoSnap.data().photo;
      }
    }

    const cardDiv = document.createElement("div");
    cardDiv.className = "work__card mix " + tagClass;
    const cardContent = `
            <img src="${photo}" alt="" class="work__img">
            <h3 class="work__title">${data.name}</h3>
            <a href="read.html?postId=${id}" class="work__button">
              Read More <i class='bx bx-right-arrow-alt work__icon'></i>
            </a>
        `;
    cardDiv.innerHTML = cardContent;
    workContainer.appendChild(cardDiv);
  }
}

async function fetchAndRenderBlog(blog_id) {
  const postRef = doc(db, "blog", blog_id);
  const docSnap = await getDoc(postRef);
  const postContainer = document.querySelector(".blog");
  if (docSnap.exists()) {
    const data = docSnap.data();
    postContainer.innerHTML = "";
    let photo = "";
    if (data.cover_photo && data.cover_photo.path) {
      const photoRef = doc(db, data.cover_photo.path);
      const photoSnap = await getDoc(photoRef);
      if (photoSnap.exists()) {
        photo = photoSnap.data().photo;
      }
    }
    const postDiv = document.createElement("div");
    postDiv.className = "post__content";
    const postContent = `
      <img src="${photo}" alt="" class="post__img">
      <h2 class="post__title">${data.name}</h2>
      <p class="post__date">${formatDate(data.publish_date)}</p>
      <p class="post__text">${data.content[0].value}</p>
    `;

    function formatDate(timestamp) {
      const date = new Date(timestamp.seconds * 1000);
      const day = date.getDate();
      const month = date.getMonth() + 1;
      const year = date.getFullYear();
      return `${day}-${month}-${year}`;
    }
    postDiv.innerHTML = postContent;
    postContainer.appendChild(postDiv);
  }
}

if (!postId) {
  fetchAndRenderTags();
  fetchAndRenderBlogs();
} else {
  fetchAndRenderBlog(postId);
}
