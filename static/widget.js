(function() {

// Localize jQuery variable
var jQuery;

/******** Load jQuery if not present *********/
if (window.jQuery === undefined || window.jQuery.fn.jquery !== '1.4.2') {
    var script_tag = document.createElement('script');
    script_tag.setAttribute("type","text/javascript");
    script_tag.setAttribute("src","http://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js");
    //script_tag.setAttribute("src","http://127.0.0.1:8000/static/javascript/jquery-1.7.2.min.js");

    if (script_tag.readyState) {
      script_tag.onreadystatechange = function () { // For old versions of IE
          if (this.readyState == 'complete' || this.readyState == 'loaded') {
              scriptLoadHandler();
          }
      };
    } else {
      script_tag.onload = scriptLoadHandler;
    }
    // Try to find the head, otherwise default to the documentElement
    (document.getElementsByTagName("head")[0] || document.documentElement).appendChild(script_tag);
} else {
    // The jQuery version on the window is the one we want to use
    jQuery = window.jQuery;
    main();
}

/******** Called once jQuery has loaded ******/
function scriptLoadHandler() {
    // Restore $ and window.jQuery to their previous values and store the
    // new jQuery in our local jQuery variable
    jQuery = window.jQuery.noConflict(true);
    // Call our main function
    main(); 
}

/******** Our main function ********/
function main() { 
    jQuery(document).ready(function($) { 
      /******* Load HTML *******/    
      var username = $("#tuva_wstag").attr("username");
      var api_key = $("#tuva_wstag").attr("api_key");
      var article_id = "random"; // get this from client similar to .attr()
      var jsonp_url = "http://widget.tuvalabs.com/script/widget.py?api_key="+api_key+"&username="+username+"&callback=?";
      
      var whtml = "<div class=\"tuva_wbox\" id=\"tuva_wcontainer\"><div class=\"tuva_wmaintitle\"><div style=\"width:150px;float:right\">Powered by: TuvaLabs</div></div><div class=\"tuva_wbody\">  <div class=\"tuva_wqsnbox\"><div class=\"tuva_wqsntitle\"><p>Math in the news</p></div><div class=\"tuva_qbody\"><div class=\"tuva_wqsn\"></div><div class=\"tuva_error\"></div><div class=\"tuva_woptions\"><form method=\"POST\" action=\"\" id=\"tuva_form\"><div class=\"tuva_formfields\"></div></form></div></div></div><div class=\"tuva_wfooter\"><span class=\"tuva_hints\">Hints<div class=\"tuva_hintsbox\"></div></span><span class=\"tuva_feedback\">Feedback<div class=\"tuva_feedbackbox\"><p>Please share your feedback at <a href=\"mailto:hello@tuvalabs.com\">hello@tuvalabs.com</a></p></div></span><span class=\"tuva_i\">i</span></div></div><style type=\"text/css\">.tuva_wbox{width:400px;max-height:300px;font-family: 'Source Sans Pro',sans-serif;text-align:justify;}.tuva_wmaintitle{padding:0px 5px;width:360px;height:25px;border-top:2px #000 solid;padding:0px 0px 0px 5px;}.tuva_wbody{width:360px;border:2px #000 solid;position:relative;min-height:250px;}.tuva_wqsnbox{width:360px;position:relative;}.tuva_qbody{margin-bottom:10px;max-height:250px;overflow:auto;min-height:250px;}.tuva_wqsntitle{width:355px;height:25px;border-bottom:2px #000 solid;padding:5px 0px 0px 5px;}.tuva_wqsn{padding:5px 0px 0px 10px; width:320px;}.tuva_hintsbox {display:none;bottom:0px;width:280px;background:#cdcdcd;margin:10px 0px 20px 10px; padding:15px 20px;position:absolute;}.tuva_woptions{padding:0px 0px 0px 5px; width:320px;}.tuva_feedbackbox {bottom:0px;position:absolute; width:280px;background:#cdcdcd; margin:10px 0px 20px 10px; padding:10px; display:none;}.tuva_wfooter{border-top:2px #000 solid;}.tuva_hints{border-right:1px #000 solid;padding:2px 20px 0px 20px; }.tuva_feedback{border-right:1px #000 solid;padding:2px 60px 0px 60px;}.tuva_error{ padding:0px 0px 0px 10px; margin-bottom:10px;color: #FF0000; }.tuva_successmsg{ width:280px;background:#cdcdcd; margin:10px 0px 20px 10px; padding:15px 20px; }</style>";
      $("#tuva_wstag").after(whtml);
    $('.tuva_wqsn').html("<b>Loading...</b>");
      $.getJSON(jsonp_url, function(data) {
          if(data.fail=='0'){
             var correct_ans = data.correct_answer;
             correct_ans = correct_ans.replace(/ /g,'').toLowerCase();
             $('.tuva_wqsn').html("<p>"+data.question+"</p>");
             //$('.tuva_wqsntitle').html(data.question_title);  //TODO: Probably Unit title or something else
             $('.tuva_formfields').html(data.answer_html+"<input type=\"hidden\" value=\""+data.question_id+"\" /><br/><input type=\"submit\" value=\"Submit\" />");
             $('.tuva_hintsbox').html(data.hints);      
             $(".tuva_hints").mouseenter(function(){ $(".tuva_hintsbox").fadeIn();   }).mouseleave(function(){ $(".tuva_hintsbox").fadeOut();  });
             $(".tuva_feedback").mouseenter(function(){ $(".tuva_feedbackbox").fadeIn();   }).mouseleave(function(){ $(".tuva_feedbackbox").fadeOut(); });
             $("#tuva_form").submit(function(e){
          e.preventDefault(); 
          var formdata = $("#tuva_form").serializeArray();
          //Retrieve answer and question_id
          var currqsn, answer;
          jQuery.each(formdata, function(key, val){
          if(val["name"] == "tuva_answer")
            answer = val["value"];
          });
         $(".tuva_error").hide();
         if(answer==undefined){  
           $(".tuva_error").html("Please submit an answer"); 
           $(".tuva_error").show();  
         } else {
           var qsn_answer = answer.replace(/ /g,'').toLowerCase(); 
           if(qsn_answer==correct_ans){
            $(".tuva_qbody").html("<div class=\"tuva_successmsg\">Your answer is correct. Thanks for submitting the answer, to checkout more visit <a href='http://www.tuvalabs.com'>TuvaLabs</a></div>");
           } else{
            $(".tuva_error").html("Answer is incorrect. Please submit again.");
            $(".tuva_error").show();
          }
        } 
            return false;
          });
          } else if(data.fail=='1'){
               $('.tuva_wqsn').html("<p>There was an error please contact the web administrator</p>");
          }
        }).error(function(jqXHR, textStatus, errorThrown) {
          $('.tuva_wqsn').html("error: <span>"+textStatus + "</span><br/>Incoming Text:<span>"+jqXHR.responseText+"</span>");
          console.log("error " + textStatus);
          console.log("incoming Text " + jqXHR.responseText);
        });
      });
  }
})();

