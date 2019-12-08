//write all Calls to Node Server Here CRUD Implementation
//The method callCRUD will be used to communicate to the backend returns the JS promise
//You can use the jQuery ajax or some other framework dependency to make REST Call
sap.ui.define([],function(){
	
	return {
		//How many students have pending payments in each batch
		//all the students whos total payment for a course is less then course fee, consider waiver not provided
		getPendingStudentsReport: function(formatType){
			return new Promise(function(resolve, reject) {
				//Algo: all the students whos total payment for a course is less then course fee, consider waiver not provided
				//      Student Name, Email Id, Course Name, Reminder_date, Pending Amount, Last Payment date, Last Payment Amount
				//      select subs_id, course_id, sum(payment_amount) from 
				// 		oft_subscription as subs join oft_course as course on subs.course_id = course.course_id	 where waiver <> 'X'	         
				//      group by subs_id, course_id
				//      having sum(payment_amount) < course.fee_amount
				switch (formatType) {
					case "PDF":
						
						break;
					case "Excel":
						
						break;
					default:
						//return JSON Data
				}
			});
		},
		//How many students using same server user
		// get the server user with end date and find emails who are using same user
		getServerUsageReport: function(formatType){
			return new Promise(function(resolve, reject) {
				switch (formatType) {
					case "PDF":
						
						break;
					case "Excel":
						
						break;
					default:
						//return JSON Data
				}
			});
		},
		//What are all bases on goin and status
		//Batches where the batch end date is more than today;s date
		getOngoingBatches: function(formatType){
			return new Promise(function(resolve, reject) {
				switch (formatType) {
					case "PDF":
						
						break;
					case "Excel":
						
						break;
					default:
						//return JSON Data
				}
			});
		}
		
	};
});