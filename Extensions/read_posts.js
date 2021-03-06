//* TITLE Read Posts **//
//* VERSION 0.1 REV G **//
//* DESCRIPTION Dim old posts **//
//* DETAILS Dims the posts on the dashboard that you've already seen on previous page loads. **//
//* DEVELOPER bit-shift **//
//* FRAME false **//
//* BETA true **//

XKit.extensions.read_posts = new Object({

	running: false,

	preferences: {
		"dim_avatars_only": {
			text: "Dim only the avatars on read posts.",
			default: false,
			value: false
		}
	},

	dashboard_regex: new RegExp("^https?://www.tumblr.com/dashboard(?:$|/)\\#?"),

	last_undimmed: "",

	run: function() {
		XKit.tools.init_css('read_posts');
		XKit.post_listener.add('read_posts_process', this.process_posts);
		this.process_posts();
 		$(document).on("click",".post_notes_inner *, .post_control.reply, .tumblelog_menu_button, .share_social_button, .post_control_menu", XKit.extensions.read_posts.undim);
 		// $(document).on("click",".popover_inner *, #glass_overlay", XKit.extensions.read_posts.redim);

		this.running = true;
	},

	redim: function(e) {

		// This is broken and meh.
		var m_obj = $(XKit.extensions.read_posts.last_dimmed).find(".post");
		if (!$(XKit.extensions.read_posts.last_dimmed).hasClass("post")) {
			var m_obj = $(m_obj).parentsUntil('.post').parent();
		}
		if (!$(m_obj).hasClass("post")) {
			// STILL?!
			return;
		}
		$(m_obj).addClass("read_posts_read");
		if (XKit.extensions.read_posts.preferences.dim_avatars_only.value === true) {
			$(m_obj).addClass('read_posts_avatar_only');
		}
	},

	undim: function(e) {

		var m_obj = $(e.target)[0];
		if (!$(m_obj).hasClass("post")) {
			m_obj = $(m_obj).parentsUntil('.post').parent();
		}

		if (!m_obj.hasClass("read_posts_read")) {
			return;
		} else {
			XKit.extensions.read_posts.last_dimmed = m_obj;
			$(m_obj).removeClass("read_posts_read");
			$(m_obj).removeClass('read_posts_avatar_only');
		}


	},

	mark_post_read: function(post_id) {
		var read_posts = JSON.parse(XKit.storage.get('read_posts', 'read_posts', '[]'));

		if(XKit.storage.quota('read_posts') <= (post_id.length + 50)) {
			/* drop oldest ~33.3% of posts to make room for new */
			read_posts = read_posts.slice(Math.round(read_posts.length / 2));
		}

		read_posts.push(post_id);
		XKit.storage.set('read_posts', 'read_posts', JSON.stringify(read_posts));
	},

	post_is_read: function(post_id) {
		var read_posts = JSON.parse(XKit.storage.get('read_posts', 'read_posts', '[]'));
		if (read_posts.indexOf(post_id) > -1) {
			return true;
		} else {
			return false;
		}
	},

	process_posts: function() {
		if (!(location.href.match(XKit.extensions.read_posts.dashboard_regex))) {
			return;  /* don't run on non-dashboard, since that can be in the background of a new post page */
		}

		$('.post.with_permalink').not('.read_posts_done').not(".xkit_view_on_dash_post").each(function(index) {
			var post_id = $(this).attr('id').replace('post_', '');

			if (XKit.extensions.read_posts.post_is_read(post_id)) {
				$(this).addClass('read_posts_read');
				if (XKit.extensions.read_posts.preferences.dim_avatars_only.value === true) {
					$(this).addClass('read_posts_avatar_only');
				}
			} else {
				XKit.extensions.read_posts.mark_post_read(post_id);
			}

			$(this).addClass('read_posts_done');
		});
	},

	remove_classes: function() {
		$('.post.read_posts_done').removeClass('read_posts_done');
		$('.post.read_posts_read').removeClass('read_posts_read');
		$('.post.read_posts_avatar_only').removeClass('read_posts_avatar_only');
	},

	destroy: function() {
		this.remove_classes();
		XKit.tools.remove_css('read_posts');
		XKit.post_listener.remove('read_posts_process');
 		$("document").off("click",".post.read_posts_read .post_control.reply", XKit.extensions.read_posts.undim);
		this.running = false;
	}

});