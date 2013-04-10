#!/usr/local/bin/python2.7

import cgi

#Added by WF support:
import cgitb; cgitb.enable()
import sys
import requests
import json
from HTMLParser import HTMLParser
import re
import logging
from random import choice

print "Content-Type: text/javascript\n"

''' 
	CGI script to get widget request and respond with question related to the news article
	Call TuvaLabs API and get required info 
	
'''
class MLStripper(HTMLParser):
    def __init__(self):
        self.reset()
        self.fed = []
    def handle_data(self, d):
        self.fed.append(d)
    def get_data(self):
        return ''.join(self.fed)

def strip_tags(html):
    s = MLStripper()
    s.feed(html)
    return s.get_data()

def question_api_call(username,api_key):
	headers = {'content-type': 'application/json', 'Accept': 'application/json', 'username':username, 'api_key':api_key}
	
	#temp code for demo
	offset_limit=[131,132,133,134]
	offset = choice(offset_limit)
	#url = 'http://tuvalabs.com/api/v1/widgetquestions/?limit=1&offset=130'#%(offset)
	url = 'http://tuvalabs.com/api/v1/widgetquestions/%s/'%(offset)
	data = {} 
	result = {}

	try:
		r = requests.get(url,headers=headers)
		data = r.json()
	except:
		#write it to apache log
		sys.stderr.write("Exception on fetching question: %s"%(sys.exc_info()[0]))
		pass
	
	if data:
		question = datax["question_desc"] 
		hints = data["hints"]["hint_desc"] 
		question_id = data["id"]
		answer_type = data["questionanswer"]["answer_type"]
		answer_html = ""
		if answer_type=="MCR":
			answer_choices = data["questionanswer"]["answerchoice"]
			for x in answer_choices:
				answer_html += "<span><input type='radio' id='tuva_ans_"+str(x["choice_name"])+"' name='tuva_answer' value='"+ str(x["choice_value"]) +"'/>&nbsp;&nbsp;<label for='tuva_ans_"+str(x["choice_name"])+"'>"+ str(x["choice_name"]) +"</label></span><br/>"
		elif answer_type=="MCC":
			answer_choices = data["questionanswer"]["answerchoice"]
			for x in answer_choices:
				answer_html += "<span><input type='checkbox' id='tuva_ans_"+str(x["choice_name"])+"' name='tuva_answer' value='"+ str(x["choice_value"]) +"'/>&nbsp;&nbsp;<label for='tuva_ans_"+str(x["choice_name"])+"'>"+ str(x["choice_name"]) +"</label></span><br/>"
		else:
			answer_html += "<span><input id='tuva_ans_wp' type='text'  name='tuva_answer'/><label for='tuva_ans_wp'></label></span><br/>"	
		correct_answer = data["questionanswer"]["correct_answer"]
		result = { "fail":0, "question":question, "hints":hints, "question_id":question_id, "answer_html":answer_html, "correct_answer":correct_answer }
	else:
		result["fail"]=1

	return result


def main():
	form = cgi.FieldStorage()
	#check for fields returning answer and question id else get the question and return
		
	if not ('callback' or 'api_key' or 'username') in form:
		jsonp = "%s" + "('{\'fail\':1}')"
		sys.stderr.write("All or some of required parameter is missing: callback, api_key, username")
		print jsonp % form['callback'].value
	else:
		try:
			response_data = {}
			username = form['username'].value	
			api_key = form['api_key'].value

			data = question_api_call(username, api_key)
			
			#string conversion - single quote escape, % questions escape
			response_data = str(json.dumps(data).replace("'",r"\'").replace("%","%%"))
			jsonp = "%s" + "(" + response_data + ")"
			sys.stderr.write(jsonp)
			sys.stderr.write(jsonp % form['callback'].value) #to write in the apache log
			print jsonp % form['callback'].value
		except:
			sys.stderr.write("Exception: %s"%(sys.exc_info()[0]))
			pass
	'''
	data = question_api_call("trickster", "d95b463ad593cd221a7cd7c283cc3601bf675d8d")
	response_data = str(json.dumps(data).replace("'",r"\'"))
	import pdb;pdb.set_trace()
	'''	
#call main function
main()

