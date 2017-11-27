/*
// From the original Spectagram and completely modified to use the feed from the website and not from the API
*/


if (typeof Object.create !== "function") {
	Object.create = function (obj) {
		function F() { }
		F.prototype = obj;
		return new F();
	};
}

var callAPICounter = 0;

(function ($, window, document, undefined) {

	var Instagram = {
		// Take 20 pictures from the tag search results
		// This URL is not the API (Insta API sucks a little in terms of approval ... the developer policy is just stupid), 
		// it's taken from the AJAX call in the website when you scroll the page (images are loadde in an infinite scroll).
		API_URL: "https://www.instagram.com/graphql/query/?query_id={query_id_to_put}&variables={%22tag_name%22:%22hackathonnc2017%22,%22first%22:20}",

		// Initialize function
		initialize: function (options, elem) {
			this.elem = elem;
			this.$elem = $(elem);
			this.options = $.extend({}, $.fn.spectragram.options, options);
		},

		getRecentTagged: function () {
			var self = this;
			self.fetch().done(function (results) {
				if (results.data.hashtag.edge_hashtag_to_media.edges.length) {
					self.display(results);
				} else {
					$.error("Spectragram.js - Error: the tag " + self.options.query + " does not have results.");
				}
			});
		},

		fetch: function () {
			return $.ajax({
				type: "GET",
				dataType: "json",
				cache: false,
				url: this.API_URL
			});
		},

		display: function (results) {

			var $element,
				$image,
				isWrapperEmpty,
				imageGroup = [],
				imageCaption,
				imageHeight,
				imageWidth,
				max,
				setSize,
				size;

			isWrapperEmpty = $(this.options.wrapEachWith).length === 0;

			if (results.data === undefined || results.status !== 'ok' ||
				results.data.hashtag.edge_hashtag_to_media.edges.length === 0) {
				if (isWrapperEmpty) {
					this.$elem.append(this.messages.notFound);
				} else {
					this.$elem.append($(this.options.wrapEachWith).append(this.messages.notFound));
				}
			} else {
				max = Object.keys(results.data.hashtag.edge_hashtag_to_media.edges).length;
				size_id = 1; // Taille de l'image affichée
				for (var i = 0; i < max; i++) {
					size = results.data.hashtag.edge_hashtag_to_media.edges[i].node.thumbnail_resources[size_id].src;
					imageHeight = results.data.hashtag.edge_hashtag_to_media.edges[i].node.thumbnail_resources[size_id].config_height;
					imageWidth = results.data.hashtag.edge_hashtag_to_media.edges[i].node.thumbnail_resources[size_id].config_width;
					captionText = results.data.hashtag.edge_hashtag_to_media.edges[i].node.edge_media_to_caption.edges[0].node.text;

					$image = $("<img>", {
						attr: {
							height: imageHeight,
							width: imageWidth
						},
						src: size
					});

					$element = $("<a>", {
						href: size,
						target: "_blank",
					}).append($image);

					if (isWrapperEmpty) {
						imageGroup.push($element);
					} else {
						imageGroup.push($(this.options.wrapEachWith)
							.append($element)
							//.append("<div style='width: 100px;'>" + captionText + " </div>")
						);
					}
				}

				this.$elem.append(imageGroup);
			}

			if (typeof this.options.complete === "function") {
				this.options.complete.call(this);
			}
		}
	}

	jQuery.fn.spectragram = function (method, options) {
		this.each(function () {
			var instagram = Object.create(Instagram);

			instagram.initialize(options, this);

			if (instagram[method]) {
				return instagram[method](this);
			} else {
				$.error("Method " + method + " does not exist on jQuery.spectragram");
			}
		});
	};

	// Plugin Default Options
	jQuery.fn.spectragram.options = {
		complete: null,
		max: 10,
		query: "instagram",
		size: "medium",
		wrapEachWith: "<li></li>"
	};

	// Instagram Access Data
	jQuery.fn.spectragram.accessData = {
		accessToken: null,
		clientID: null
	};

})(jQuery, window, document);