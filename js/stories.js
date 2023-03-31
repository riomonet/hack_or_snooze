"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;

/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
  storyList = await StoryList.getStories();
  $storiesLoadingMsg.remove();

  putStoriesOnPage('all');
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */

function generateStoryMarkup(story, type) {
  // console.debug("generateStoryMarkup", story);
 
    let star;
    let del;

    if(currentUser){

	if (story.username == currentUser.username && type == 'own') 
	    del =  "<span class='trash'><i class='fas fa-trash-alt'></i> </span>"
	else
	    del = '';
	
	let y =  currentUser.favorites.findIndex((x) => x.storyId == story.storyId)

	if (y > -1)
	    star = "<span class='star'><i class='fas fa-star'></i> </span>"
	else
	    star = "<span class='star'><i class='far fa-star'></i> </span>"

    } else star ='';


    const hostName = story.getHostName();
    return $(`
      <li id="${story.storyId}">${del}${star}
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small><br>
        <small class="story-author">by ${story.author}</small>
        <small class="story-user">posted by ${story.username}</small>
      </li>
    `);
}

/** Gets list of stories from server, generates their HTML, and puts on page. */

function putStoriesOnPage(type) {
  console.debug("putStoriesOnPage");

    let arr;

    $allStoriesList.empty();

    if (type == 'fav')
	arr = currentUser.favorites;

    else if (type == 'own')
	arr = currentUser.ownStories;

    else if (type == 'all')
	arr = storyList.stories;

  // loop through all of our stories and generate HTML for them
  for (let story of arr) {
      const $story = generateStoryMarkup(story, type);
      $allStoriesList.append($story);
  }
    $allStoriesList.show();
}

$addStoryForm.on('submit', async function (evt) {

    evt.preventDefault;
    const author = $("#add-story-author").val();
    const url = $("#add-story-url").val();
    const title = $("#add-story-title").val();
    let story = await storyList.addStory(currentUser,{author, title, url});
    currentUser.ownStories.push(story);
    getAndShowStoriesOnStart();
    $addStoryForm.hide();
});


$allStoriesList.on('click','.fa-star' , async function (evt) {

    evt.preventDefault();
    
    const userName = currentUser.username;
    const storyId = $(this).parents("li").attr('id');
    const story = storyList.stories.find(element => element.storyId == storyId);
    const storyIndex = currentUser.favorites.findIndex(element => element.stoyrId == storyId)
    
    let action;
    

    if ($(this).hasClass("far")) {
	action = "POST";
	currentUser.favorites.push(story);
    }
    else {
	action = "DELETE";
	currentUser.favorites.splice(storyIndex,1);
    }
    
    const response = await axios({
	url: `${BASE_URL}/users/${userName}/favorites/${storyId}`,
	method: `${action}`,
	data: {
	    token : currentUser.loginToken,
	}
    });
    
    $(this).toggleClass("fas far");
});



$("#nav-show-favorites").on('click',function() {

    hidePageComponents();
    putStoriesOnPage('fav');

});


$('#nav-my-stories').on('click', function (){

    hidePageComponents();
    putStoriesOnPage('own');
    
});


$allStoriesList.on('click','.fa-trash-alt' , async function (evt) {

    const storyId = $(this).parents("li").attr('id');
    const storyIndex = currentUser.ownStories.findIndex(element => element.storyId == storyId)

    const response = await axios({
	url: `${BASE_URL}/stories/${storyId}`,
	method: `DELETE`,
	data: {
	    token : currentUser.loginToken,
	}
    });

    currentUser.ownStories.splice(storyIndex,1);
    
    putStoriesOnPage('own');
    
});
