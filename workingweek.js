var WorkingWeek = {

	/**
	 * Enum listing all days of the week.
	 */
	DayOfWeek: {
		Sunday: 0,
		Monday: 1,
		Tuesday: 2,
		Wednesday: 3,
		Thursday: 4,
		Friday: 5,
		Saturday: 6
	},
	
	/**
	 * TimeSpan class provides similar functionality to the TimeSpan class in
	 * C#.
	 * @param days The number of days in the span.
	 * @param hours The number of hours in the span.
	 * @param minutes The number of minutes in the span.
	 * @param seconds The number of seconds in the span.
	 * @param milliseconds The number of milliseconds in the span.
	 */
	TimeSpan: function(days, hours, minutes, seconds, milliseconds) {
		this.milliseconds = milliseconds;
		this.milliseconds += seconds * 1000;
		this.milliseconds += minutes * 60 * 1000;
		this.milliseconds += hours * 60 * 60 * 1000;
		this.milliseconds += days * 24 * 60 * 60 * 1000;
	},

	/**
	 * Represents a single shift within a working day.
	 * @param hour The start hour of the shift.
	 * @param minute The start minute of the shift.
	 * @param second The start second of the shift.
	 * @param millisecond The start millisecond of the shift.
	 * @param duration A TimeSpan representing the duration of the shift.
	 */
	Shift: function(hour, minute, second, millisecond, duration) {
		this.startTime = new Date(1970, 1, 1, hour, minute, second, millisecond);
		this.duration = duration;
	},

	/**
	 * Represents a working day.
	 * @param dayOfWeek The day of the week represented by the object, which
	 * should be a value from the DayOfWeek enum.
	 */
	Day: function(dayOfWeek) {
		this.dayOfWeek = dayOfWeek;
		this.shifts = new Array();
		this.duration = new WorkingWeek.TimeSpan(0, 0, 0, 0, 0);
	},
	
	/**
	 * Represents a working week.
	 */
	Week: function() {
		this.duration = new WorkingWeek.TimeSpan(0, 0, 0, 0, 0);
		this.days = new Array();
		
		for (var i = 0; i < 7; ++i) {
			this.days[i] = new WorkingWeek.Day(i);
		}
	}
}



/** TimeSpan Methods **/

/**
 * Gets the total number of milliseconds in the duration.
 */
WorkingWeek.TimeSpan.prototype.getTotalMilliseconds = function() {
	return this.milliseconds;
}

/**
 * Gets the number of days in the time span, excluding partial days.
 */
WorkingWeek.TimeSpan.prototype.getDays = function() {
	return parseInt(this.getTotalDays());
}

/**
 * Gets the number of hours in the time span, excluding days or partial hours.
 * If the span had 2 days, 3 hours and 25 minutes, the function will return 3.
 */
WorkingWeek.TimeSpan.prototype.getHours = function() {
	return parseInt(this.getTotalHours() % 24);
}

WorkingWeek.TimeSpan.prototype.getMinutes = function() {
	return parseInt(this.getTotalMinutes() % 60);
}

WorkingWeek.TimeSpan.prototype.getSeconds = function() {
	return parseInt(this.getTotalSeconds() % 60);
}

WorkingWeek.TimeSpan.prototype.getMilliseconds = function() {
	return parseInt(this.milliseconds % 1000);
}

WorkingWeek.TimeSpan.prototype.getTotalDays = function() {
	return this.milliseconds / (1000 * 60 * 60 * 24);
}

WorkingWeek.TimeSpan.prototype.getTotalHours = function() {
	return this.milliseconds / (1000 * 60 * 60);
}

WorkingWeek.TimeSpan.prototype.getTotalMinutes = function() {
	return this.milliseconds / (1000 * 60);
}

WorkingWeek.TimeSpan.prototype.getTotalSeconds = function() {
	return this.milliseconds / 1000;
}

WorkingWeek.TimeSpan.prototype.addTimeSpan = function(span) {
	return new WorkingWeek.TimeSpan(0, 0, 0, 0, this.milliseconds + span.getTotalMilliseconds());
}

WorkingWeek.TimeSpan.prototype.subtractTimeSpan = function(span) {
	return new WorkingWeek.TimeSpan(0, 0, 0, 0, this.milliseconds - span.getTotalMilliseconds());
}

WorkingWeek.TimeSpan.prototype.compareTo = function(span) {
	if (this.milliseconds > span.getTotalMilliseconds()) return 1;
	if (this.milliseconds < span.getTotalMilliseconds()) return -1;
	return 0;
}



/** Shift Methods **/

/**
 * Gets the start time of the shift.
 * @return The start time of the shift, as a Date object.
 */
WorkingWeek.Shift.prototype.getStartTime = function() {
	return this.startTime;
}

/**
 * Gets the duration of the shift.
 * @return The duration of the shift, as a TimeSpan object.
 */
WorkingWeek.Shift.prototype.getDuration = function() {
	return this.duration;
}

/**
 * Gets the end time of the shift.
 * @return The end time of the shift, as a Date object.
 */
WorkingWeek.Shift.prototype.getEndTime = function() {
	return new Date(this.startTime.getTime() + this.duration.getTotalMilliseconds());
}

/**
 * Compares one shift with another.
 * @return -1 if the current shift comes before the supplied shift, 1 if the
 * current shift comes after the supplied shift, or 0 if the shifts are the
 * same.
 */
WorkingWeek.Shift.prototype.compareTo = function(shift) {
	if (this.startTime > shift.getStartTime()) return 1;
	if (this.startTime < shift.getStartTime()) return -1;
	
	return this.duration.compareTo(shift.getDuration());
}
	


/** Day Methods **/

WorkingWeek.Day.prototype.isWorking = function() {
	return this.shifts.length > 0;
}

WorkingWeek.Day.prototype.getDuration = function() {
	return this.duration;
}

WorkingWeek.Day.prototype.findShift = function(date) {
	
	// Ensure the search time uses the minimum available date
	var searchTime = new Date(1970, 1, 1, date.getHours(), date.getMinutes(), date.getSeconds(), date.getMilliseconds());
	
	for (i in this.shifts) {
		if ((searchTime >= this.shifts[i].getStartTime()) && (searchTime < this.shifts[i].getEndTime())) return this.shifts[i];
	}
	
	return false;
}

WorkingWeek.Day.prototype.isWorkingTime = function(date) {
	return (this.findShift(date) != false);
}

WorkingWeek.Day.prototype.addShift = function(hour, minute, second, millisecond, duration) {
	var date = new Date(1970, 1, 1, hour, minute, second, millisecond);
	
	if (this.isWorkingTime(date)) throw("New shift conflicts with existing shift.");
	
	var shift = new WorkingWeek.Shift(hour, minute, second, millisecond, duration);
	
	// Ensure shifts are inserted in sorted order
	var inserted = false;
	
	for (var i = 0; i < this.shifts.length; ++i) {
		if (shift.compareTo(this.shifts[i]) < 0) {
			this.shifts.push(shift);
			inserted = true;
			break;
		}
	}
	
	if (!inserted) {
		this.shifts = this.shifts.concat(shift);
	}
	
	this.duration = this.duration.addTimeSpan(duration);
}

WorkingWeek.Day.prototype.removeShift = function(hour, minute, second, millisecond) {
	var shift = false;
	var startTime = false;
	
	for (var i = 0; i < this.shifts.length; ++i) {
		shift = this.shifts[i];
		startTime = shift.getStartTime();
		
		if ((startTime.getHours() == hour) &&
			(startTime.getMinutes() == minute) &&
			(startTime.getSeconds() == second) &&
			(startTime.getMilliseconds() == millisecond)) {
			
			// Remove the shift's duration along with the shift itself
			this.duration = this.duration.subtractTimeSpan(shift.getDuration());
			this.shifts = this.shifts.splice(i, 1);
			break;
		}
	}
}

/**
 * Get the next shift after the supplied date.  If the next appropriate shift
 * contains the supplied date, that shift is returned.
 * @param date Date of the shift to find.
 * @returns The appropriate shift, or false if no shift is found.
 */
WorkingWeek.Day.prototype.getNextShift = function(date) {

	// Ensure that the supplied date matches this day of the week
	if (date.getDay() != this.dayOfWeek) throw("Supplied date contains the wrong day of the week.");
	
	// Adjust the date to search for so that it consists only of the time; the date is not relevant
	var searchTime = new Date(1970, 1, 1, date.getHours(), date.getMinutes(), date.getSeconds(), date.getMilliseconds());
	
	for (i in this.shifts) {
		
		// Does the shift contain the date?
		if (searchTime < this.shifts[i].getEndTime()) {
		
			// If the shift starts after the date, return the entire shift
			if (searchTime <= this.shifts[i].getStartTime()) return this.shifts[i];
			
			// The date occurs somewhere within the shift, so adjust the shift so that it starts at the date and return that
			var milliseconds = this.shifts[i].getDuration().getTotalMilliseconds();
			milliseconds -= (searchTime.getTime() - this.shifts[i].getStartTime().getTime());
			
			var duration = new WorkingWeek.TimeSpan(0, 0, 0, 0, milliseconds);
			
			return new WorkingWeek.Shift(searchTime.getHours(), searchTime.getMinutes(), searchTime.getSeconds(), searchTime.getMilliseconds(), duration);
		}
	}
	
	return false;
}

/**
 * Get the shift prior to the supplied date.  If the next appropriate shift
 * contains the supplied date, that shift is returned.
 * @param date Date of the shift to find.
 * @returns The appropriate shift, or false if no shift is found.
 */
WorkingWeek.Day.prototype.getPreviousShift = function(date) {

	// Ensure that the supplied date matches this day of the week
	if (date.getDay() != this.dayOfWeek) throw("Supplied date contains the wrong day of the week.");
	
	// Adjust the date to search for so that it consists only of the time; the date is not relevant
	var searchTime = new Date(1970, 1, 1, date.getHours(), date.getMinutes(), date.getSeconds(), date.getMilliseconds());
	
	for (var i = this.shifts.length - 1; i >= 0; --i) {
	
		var shift = this.shifts[i];
		
		// Does the shift contain the date?
		if (searchTime > shift.getStartTime()) {
		
			// If the shift ends after the date, return the entire shift
			if (searchTime >= shift.getEndTime()) return shift;
			
			// The date occurs somewhere within the shift, so adjust the shift
			var milliseconds = searchTime.getTime() - shift.getStartTime().getTime();
			
			var duration = new WorkingWeek.TimeSpan(0, 0, 0, 0, milliseconds);
			
			return new WorkingWeek.Shift(shift.getStartTime().getHours(), shift.getStartTime().getMinutes(), shift.getStartTime().getSeconds(), shift.getStartTime().getMilliseconds(), duration);
		}
	}
	
	return false;
}



/** Week Methods **/

WorkingWeek.Week.prototype.getDuration = function() {
	var duration = new WorkingWeek.TimeSpan(0, 0, 0, 0, 0);
	
	for (i in this.days) {
		duration = duration.addTimeSpan(this.days[i].getDuration());
	}
	
	return duration;
}

WorkingWeek.Week.prototype.containsShifts = function() {
	for (i in this.days) {
		if (this.days[i].isWorking()) return true;
	}
	
	return false;
}

WorkingWeek.Week.prototype.getDay = function(dayOfWeek) {
	return this.days[dayOfWeek];
}

WorkingWeek.Week.prototype.addShift = function(dayOfWeek, hour, minute, second, millisecond, duration) {
	this.getDay(dayOfWeek).addShift(hour, minute, second, millisecond, duration);
}

WorkingWeek.Week.prototype.removeShift = function(dayOfWeek, hour, minute, second, millisecond) {
	this.getDay(dayOfWeek).removeShift(hour, minute, second, millisecond);
}

WorkingWeek.Week.prototype.isWorkingDate = function(date) {
	var workingDay = this.getDay(date.getDay());
	
	if (!workingDay) return false;
	
	if (!workingDay.isWorking()) return false;
	
	return workingDay.isWorkingTime(date);
}

WorkingWeek.Week.prototype.isWorkingDay = function(dayOfWeek) {
	return this.getDay(dayOfWeek).isWorking();
}

WorkingWeek.Week.prototype.getNextShift = function(date) {
	if (!this.containsShifts()) return false;
	
	for (var i = 0; i < 7; ++i) {
		var day = this.days[date.getDay()];
		
		if (day.isWorking()) {
		
			var shift = day.getNextShift(date);
		
			if (shift != false) return shift;
		}
		
		// Move to the next day
		date = new Date(date.getTime() + (24 * 60 * 60 * 1000));
		date.setHours(0);
		date.setMinutes(0);
		date.setSeconds(0);
		date.setMilliseconds(0);
	}
	
	// No shifts match - this should never happen if the week passes the
	// containsShifts() check.
	return false;
}

WorkingWeek.Week.prototype.getPreviousShift = function(date) {
	if (!this.containsShifts()) return false;
	
	for (var i = 0; i < 7; ++i) {
		var day = this.days[date.getDay()];
		
		if (day.isWorking()) {
			var shift = day.getPreviousShift(date);
			
			if (shift != false) return shift;
		}
		
		// Move to the previous day
		date.setHours(0);
		date.setMinutes(0);
		date.setSeconds(0);
		date.setMilliseconds(0);
		
		date = new Date(date.getTime() - 1);
	}
}

// TODO:
// getPreviousShift
// dateAddPositive (consider a name that uses the verbNoun structure)
// dateAddNegative (ditto)
// dateAdd
// dateDiff
