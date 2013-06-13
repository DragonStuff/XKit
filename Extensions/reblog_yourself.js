//* TITLE Reblog Yourself **//
//* VERSION 1.1 REV B **//
//* DESCRIPTION Allows you to reblog posts back to your blog **//
//* DEVELOPER STUDIOXENIX **//
//* FRAME false **//
//* BETA false **//
//* SLOW true **//

XKit.extensions.reblog_yourself = new Object({

	running: false,
	slow: true,

	run: function() {
		this.running = true;

		if (document.location.href.indexOf("http://www.tumblr.com/reblog/") !== -1) {
			XKit.extensions.reblog_yourself.fix_page();
		}
	
		if ($(".post").length > 0) {
			$(document).on("click", ".reblog_button", function() {
				if ($(this).parentsUntil(".post").parent().hasClass("is_mine") === true) {
					XKit.extensions.reblog_yourself.fix_page();
				}
			});
		}

		XKit.post_listener.add("reblog_yourself", XKit.extensions.reblog_yourself.fix_dashboard);
		XKit.extensions.reblog_yourself.fix_dashboard();

	},
	
	frame_run: function() {
	
		// This gets run on frame.
		// Port of ugly code from XKit 6 but at least it works.
		
    		var check_if_there = $("body").html().search("/reblog/");
    		if (check_if_there !== -1) { return; }

    		var postid_start = document.location.href.search("&pid=");
    		var postid_end =  document.location.href.indexOf("&", postid_start + 2);
    		var post_id = document.location.href.substring(postid_start + 5, postid_end);

    		if (postid_start === -1) { return; }

    		var xd_start = document.location.href.search("&rk=");
    		var xd_end =  document.location.href.indexOf("&", xd_start + 2);
    		var xd = document.location.href.substring(xd_start + 4, xd_end);

    		var rd_start = document.location.href.search("src=") + 4;
    		var rd_end =  document.location.href.indexOf("&", rd_start + 2);
    		var rd = document.location.href.substring(rd_start, rd_end);
    		
    		var xu = "http://www.tumblr.com/reblog/" + post_id + "/" + xd;

		var xu_html = '<a class="btn icon reblog" id="xreblogyourselfiframebutton" style="display: none;" title="Reblog" href="/reblog/' + post_id + '/' + xd + '?redirect_to=' + rd + '" target="_top"></a>';


		$.ajax({
 			url: '/reblog/' + post_id + '/' + xd + '/',
  			success: function(data, xhr) {	
				$(".controls").prepend(xu_html);
				$("#xreblogyourselfiframebutton").fadeIn('slow');
  			}
		});	
		
	},

	fix_page_interval: "",

	fix_page: function() {

		if ($("#tumblelog_choices").length === 0) {
			setTimeout(function() { XKit.extensions.reblog_yourself.fix_page(); }, 300);
			return;
		}

		if ($("#popover_blogs").length === 0) {
			XKit.console.add("Can't run Reblog Yourself, popover_blogs not found.");
			return;
		}

		// defaults
		var m_blog_url = $("#popover_blogs").find(".popover_menu_item").first().attr('id').replace("menuitem-","");
		var m_blog_title = $("#popover_blogs").find(".popover_menu_item").first().find(".blog_title").find("span").html();

		// check which blog is missing from the list
		var m_blogs = XKit.tools.get_blogs();
		var check = [];
		for(i=0;i<m_blogs.length;i++) {
			if (m_blogs[i] !== "") {
				check = $('#tumblelog_choices .popover_inner ul li div[data-option-value='+m_blogs[i]+']');
				if(check.length == 0) {
					m_blog_url = m_blogs[i];
					m_blog_title = $("#menuitem-"+m_blog_url+" .blog_title span").html();
				}
			}
		}

		var post_avatar = $("#new_post").find(".post_avatar").attr('data-avatar-url');

		var m_html = '<div class="option" data-facebook-on="false" data-twitter-on="false" data-facebook="false" data-twitter="false" data-is-password-protected="false" data-use-sub-avatar="" data-use-channel-avatar="0" data-blog-url="http://' + m_blog_url + '.tumblr.com/" data-avatar-url="' + post_avatar +'" data-user-avatar-url="' + post_avatar +'" data-option-value="'+ m_blog_url +'" title="'+ m_blog_title +'">' + m_blog_url + '</div>';

		$("#tumblelog_choices").find(".popover_inner").find("ul").prepend("<li>" + m_html + "</li>");

	},

	fix_dashboard: function() {
		
		if ($("body").hasClass('dashboard_drafts') === true || $("body").hasClass('dashboard_post_queue') === true) {
			return;	
		}

		if ($(".post").length == 0) { return; }

		/*
			blog_id +
			post_type +
			post_id + 
			reblog_key +
			user_form_key
			reblog_id
		*/

		var user_form_key = $("body").attr('data-form-key');
		
		$('.post.is_mine').not(".xreblogyourself_done").each(function(index) {

			if ($(this).hasClass("xreblogyourself_done") === true) { return; }

	   		if ($(this).attr('id') === "new_post") { return; }
			if ($(this).hasClass("note") === true) { return; }
			if ($(this).hasClass("is_mine") === false) { return; }
	   		if ($(this).css('visibility') === "hidden") { return; } // tumblr savior hack.
	   		if ($(this).css('display') === "none") { return; } // tumblr savior hack.

			$(this).addClass("xreblogyourself_done");

	   		if ($(this).find('.post_controls').html().search('href="/reblog/') !== -1) { 
	   		   	// this user can reblog themselves?!
				XKit.console.add("This user can reblog themselves, quitting.");
	   		   	return false; 
	   		}

			var post_id = $(this).attr('data-post-id');
			var reblog_key = $(this).attr('data-reblog-key');
			var post_type = $(this).attr('data-type');
			var blog_id = $(this).attr('data-tumblelog-name');
			var reblog_id = $(this).attr('data-post-id');		
	
			if (post_id === "" ||reblog_key === "") {
				// Can't do this for some reason.
				console.log("NO REBLOG / POST ID");
				return;
			}

			// <a class="post_control post_control_icon reblog_button" title="" data-tumblelog-name="xenix" data-post-type="regular" data-reblog-key="5XJmYn8f" data-reblog-id="50250451612" data-user-form-key="0Rk2VkO4FhIFHKYsHMXFFokI0QI" href="/reblog/50250451612/5XJmYn8f?redirect_to=%2Fdashboard">Reblog</a>
			
			// New button layout:
			// <a class="post_control reblog" title="" href="/reblog/51800635787/9lQg1pX7?redirect_to=%2Fdashboard"><span class="offscreen">Reblog</span></a>
			/* 
				var m_html = "<a class=\"added_by_xkit_reblog_yourself post_control post_control_icon reblog_button\" title=\"\" data-tumblelog-name=\"" + blog_id + "\" data-post-type=\"" + post_type + "\" data-reblog-key=\"" + reblog_key + "\" data-reblog-id=\"" + reblog_id + "\" data-user-form-key=\"" + user_form_key + "\" href=\"/reblog/" + post_id + "/" + reblog_key + "?redirect_to=%2Fdashboard\">Reblog</a>";
			*/
			
			var m_html = "<a class=\"post_control reblog added_by_xkit_reblog_yourself\" title=\"\" href=\"/reblog/" + post_id + "/" + reblog_key + "?redirect_to=%2Fdashboard\"><span class=\"offscreen\">Reblog</span></a>";
			$(this).find('.post_controls_inner').prepend(m_html);
		});
	
	},

	destroy: function() {
		XKit.post_listener.remove("reblog_yourself");
		$(".added_by_xkit_reblog_yourself").remove();
		$(".xreblogyourself_done").removeClass("xreblogyourself_done");
		this.running = false;
	}

});