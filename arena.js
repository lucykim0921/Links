document.addEventListener('DOMContentLoaded', function() {
    // This allows us to process/render the descriptions, which are in Markdown!
    // More about Markdown: https://en.wikipedia.org/wiki/Markdown
    let markdownIt = document.createElement('script');
    markdownIt.src = 'https://cdn.jsdelivr.net/npm/markdown-it@14.0.0/dist/markdown-it.min.js';
    document.head.appendChild(markdownIt);

    // Okay, Are.na stuff!
    let channelSlug = 'seraphim-2t-ulfxxma0'; // The “slug” is just the end of the URL

    // First, let’s lay out some *functions*, starting with our basic metadata:
    let placeChannelInfo = (data) => {
        // Target some elements in your HTML:
        let channelTitle = document.getElementById('channel-title');
        let channelDescription = document.getElementById('channel-description');
        let channelCount = document.getElementById('channel-count');
        let channelLink = document.getElementById('channel-link');

        // Then set their content/attributes to our data:
        channelTitle.innerHTML = data.title;
        channelDescription.innerHTML = window.markdownit().render(data.metadata.description); // Converts Markdown → HTML
        // channelCount.innerHTML = data.length;
        channelLink.href = `https://www.are.na/channel/${channelSlug}`;
    };


        // Function to toggle the visibility of block-image-description
        function toggleDescription() {
        let description = this.parentElement.querySelector('.block-image-description');
        description.classList.toggle('active');
    }

        // Function to attach event listeners to images
        function attachImageListeners() {
        let images = document.querySelectorAll('#block-image img');
        images.forEach(image => {
            image.addEventListener('click', toggleDescription);
        });
    }



    // Then our big function for specific-block-type rendering:
    let renderImageBlock = (block) => {
        // To start, a shared `ul` where we’ll insert all our blocks
        let channelBlocks = document.getElementById('block-image');

        console.log("Rendering image block...")

        // Images!
        // Images!
        // Images!
        // Images!
        if (block.class == 'Image') {
            console.log("image block found:", block);
            console.log(block.description_html);
            let imageItem =
                `
                <li class="block-image">
                    <img src="${block.image.original.url}" alt="Image">

                    <div class="block-image-description">
                        <h3>${block.title}</h3>
                    </div>
                </li>
                `;
            channelBlocks.insertAdjacentHTML('beforeend', imageItem);

            let image = channelBlocks.lastElementChild.querySelector('img');
            image.addEventListener('click', toggleDescription);
        }
    };

    // It‘s always good to credit your work:
    let renderUser = (user, container) => { // You can have multiple arguments for a function!
        let userAddress =
            `
        <address class="profile">
            <img src="${ user.avatar_image.display }">
            <h3>${ user.first_name }</h3>
            <p><a href="https://are.na/${ user.slug }">Are.na profile ↗</a></p>
        </address>
        `;
        container.insertAdjacentHTML('beforeend', userAddress);
    };


    // Function to scroll to the image container section
    function scrollToImageContainer() {
        let imageContainer = document.getElementById('image-container');
        imageContainer.scrollIntoView({ behavior: 'smooth' });
    }

    // Event listener for the "Gallery" button
    let immerseButton = document.querySelector('#landing-page-nav .navigation[href="#image-container"]');
    immerseButton.addEventListener('click', function(event) {
        event.preventDefault();
        scrollToImageContainer();
    });

    // Function to scroll and snap to the top of the page
    function scrollToTop() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }

    // Event listener to the "Home" button
    let homeButton = document.getElementById('home-button');
    homeButton.addEventListener('click', function(event) {
        event.preventDefault(); // Prevent default behavior of anchor tag
        scrollToTop(); // Scroll to the top of the page
    });

    // Function to enable dragging for image blocks
    function enableDraggable() {
        let isDragging = false;
        let currentImage = null;
        let initialX = 0;
        let initialY = 0;

        // Function to handle mouse down event
        function onMouseDown(event) {
            isDragging = true;
            currentImage = this;
        
            /// Calculate initial mouse position relative to the image container
            let rect = currentImage.getBoundingClientRect();

            let scrollX = window.scrollX || window.pageXOffset;
            let scrollY = window.scrollY || window.pageYOffset;
            initialX = event.clientX - rect.left;
            initialY = event.clientY - rect.top;

            // Bring the current image to the top
            currentImage.style.zIndex = 1000;
        
            // Prevent default browser behavior
            event.preventDefault();
        
            // Add event listeners for mouse move and mouse up events
            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        }

        // Function to handle mouse move event
        function onMouseMove(event) {
            if (isDragging && currentImage) {
                // Calculate new position of the image
                let newX = event.clientX - initialX;
                let newY = event.clientY - initialY;

                // Update position of the image
                currentImage.style.left = newX + 'px';
                currentImage.style.top = newY + 'px';
            }
        }


        // Function to handle mouse up event
        function onMouseUp() {
            isDragging = false;
            currentImage = null;

            // Remove event listeners for mouse move and mouse up events
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        }

        // Get all image blocks
        let imageBlocks = document.querySelectorAll('.block-image');

        // Enable dragging for each image block
        imageBlocks.forEach(function(imageBlock) {
            // Add event listener for mouse down event
            imageBlock.addEventListener('mousedown', onMouseDown);
        });
    }

  // Function to scatter images randomly within the image container
  function scatterImagesRandomly() {
    let imageContainer = document.getElementById('image-container');
    let imageBlocks = document.querySelectorAll('.block-image');

    imageBlocks.forEach(function(imageBlock) {
        let containerRect = imageContainer.getBoundingClientRect();
        let maxX = imageContainer.offsetWidth - imageBlock.offsetWidth;
        let maxY = imageContainer.offsetHeight - imageBlock.offsetHeight;
        let randomX = Math.floor(Math.random() * maxX);
        let randomY = Math.floor(Math.random() * maxY);

        // Ensure the image stays within the bounds of the image container
        randomX = Math.max(0, randomX);
        randomY = Math.max(0, randomY);

        imageBlock.style.position = 'absolute';
        imageBlock.style.left = randomX + 'px';
        imageBlock.style.top = randomY + 'px';
    });
}

scatterImagesRandomly();

// Now that we have said what we can do, go get the data:
fetch(`https://api.are.na/v2/channels/${channelSlug}?per=100`, { cache: 'no-store' })
    .then((response) => response.json()) // Return it as JSON data
    .then((data) => { // Do stuff with the data
        console.log(data); // Always good to check your response!
        placeChannelInfo(data); // Pass the data to the first function

        // Loop through the `contents` array (list), backwards. Are.na returns them in reverse!
        data.contents.reverse().forEach((block) => {
            // console.log(block) // The data for a single block
            renderImageBlock(block); // Pass the single block data to the render function
        });

        // Also display the owner and collaborators:
        let channelUsers = document.getElementById('channel-users'); // Show them together
        data.collaborators.forEach((collaborator) => renderUser(collaborator, channelUsers));
        renderUser(data.user, channelUsers);

        scatterImagesRandomly();

        // Enable draggable functionality after rendering blocks
        enableDraggable();
    });
});