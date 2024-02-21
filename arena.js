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
        channelCount.innerHTML = data.length;
        channelLink.href = `https://www.are.na/channel/${channelSlug}`;
    };



    // Then our big function for specific-block-type rendering:
    let renderBlock = (block) => {
        // To start, a shared `ul` where we’ll insert all our blocks
        let channelBlocks = document.getElementById('channel-blocks');

        // Links!
        if (block.class == 'Link') {
            let linkItem =
                `
            <li class="block-link">
                <p><em></em></p>
                <picture>
                    <source media="(max-width: 428px)" srcset="${ block.image.thumb.url }">
                    <source media="(max-width: 640px)" srcset="${ block.image.large.url }">
                    <img src="${ block.image.original.url }">
                </picture>
                <h3>${ block.title }</h3>
                <h4>${ block.description_html }</h4>
                <p><a href="${ block.source.url }">See the original ↗</a></p>
            </li>
            `;
            channelBlocks.insertAdjacentHTML('beforeend', linkItem);
        }

		
        // Images!
        else if (block.class == 'Image') {
            console.log(block.description_html);
            let imageItem =
                `
        <li class="block-image">
            <p><em></em></p>
            <img src="${block.image.original.url}" alt="Image">
            <figcaption>${block.title}</figcaption>

            <div class="block-image-description">
                ${block.description_html}
            </div>

        </li>


        `;
            channelBlocks.insertAdjacentHTML('beforeend', imageItem);
			document.querySelectorAll('.block-image').forEach(function(image) {
				image.style.setProperty('--angle', Math.random() * 360 + 'deg');
			});
        }

        // Text!
        else if (block.class == 'Text') {
            // …up to you!
            let textItem =
                `
        <li class="block-text">
            <p><em></em></p>
            <div>${block.content_html}</div>
        </li>
        `;
            channelBlocks.insertAdjacentHTML('beforeend', textItem);
        }

        // Uploaded (not linked) media…
        else if (block.class == 'Attachment') {
            let attachment = block.attachment.content_type; // Save us some repetition

            // Uploaded videos!
            if (attachment.includes('video')) {
                // …still up to you, but we’ll give you the `video` element:
                let videoItem =
                    `
                <li class="block-video">
                    <p><em></em></p>
                    <video controls src="${block.attachment.url}"></video>
                </li>
                `;
                channelBlocks.insertAdjacentHTML('beforeend', videoItem);
                // More on video, like the `autoplay` attribute:
                // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/video
            }

            // Uploaded PDFs!
            else if (attachment.includes('pdf')) {
                // …up to you!
                let pdfItem =
                    `
                <li class="block-pdf">
                    <p><em></em></p>
                    <picture>
                        <source media="(max-width: 428px)" srcset="${ block.image.thumb.url }">
                        <source media="(max-width: 640px)" srcset="${ block.image.large.url }">
                        <img src="${ block.image.original.url }">
                    </picture>
					<h3>${ block.title }</h3>
                    <p><a href="${block.attachment.url}" target="_blank">See the original ↗</a></p>
                </li>
                `;
                channelBlocks.insertAdjacentHTML('beforeend', pdfItem);
            }

            // Uploaded audio!
            else if (attachment.includes('audio')) {
                // …still up to you, but here’s an `audio` element:
                let audioItem =
                    `
                <li>
                    <p><em></em></p>
                    <audio controls src="${ block.attachment.url }"></video>
                </li>
                `;
                channelBlocks.insertAdjacentHTML('beforeend', audioItem);
                // More on audio: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/audio
            }
        }

        // Linked media…
        else if (block.class == 'Media') {
            let embed = block.embed.type;

            // Linked video!
            if (embed.includes('video')) {
                // …still up to you, but here’s an example `iframe` element:
                let linkedVideoItem =
                    `
                <li class="block-linked-video">
                    <p><em></em></p>
                    ${ block.embed.html }
                    <h3>${ block.title }</h3>
                </li>
                `;
                channelBlocks.insertAdjacentHTML('beforeend', linkedVideoItem);
                // More on iframe: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/iframe
            }

            // Linked audio!
            else if (embed.includes('rich')) {
                // …up to you!
            }
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

    // Now that we have said what we can do, go get the data:
    fetch(`https://api.are.na/v2/channels/${channelSlug}?per=100`, { cache: 'no-store' })
        .then((response) => response.json()) // Return it as JSON data
        .then((data) => { // Do stuff with the data
            console.log(data); // Always good to check your response!
            placeChannelInfo(data); // Pass the data to the first function

            // Loop through the `contents` array (list), backwards. Are.na returns them in reverse!
            data.contents.reverse().forEach((block) => {
                // console.log(block) // The data for a single block
                renderBlock(block); // Pass the single block data to the render function
            });

            // Also display the owner and collaborators:
            let channelUsers = document.getElementById('channel-users'); // Show them together
            data.collaborators.forEach((collaborator) => renderUser(collaborator, channelUsers));
            renderUser(data.user, channelUsers);

            // Enable draggable functionality after rendering blocks
            enableDraggable();
        });
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
	
		// Calculate initial mouse position relative to the document
		let initialMouseX = event.clientX;
		let initialMouseY = event.clientY;
	
		// Calculate the initial position of the image relative to the document
		let rect = currentImage.getBoundingClientRect();
		let imageX = rect.left + window.scrollX;
		let imageY = rect.top + window.scrollY;
	
		// Calculate the initial position of the mouse relative to the image
		initialX = initialMouseX - imageX;
		initialY = initialMouseY - imageY;
	
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

// Call the function to enable dragging for image blocks
enableDraggable();
