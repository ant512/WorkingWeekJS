var WorkingWeek = {

	/**
	 * Enum listing all days of the week.
	 */
	DayOfWeek: function() {
		this.Sunday = 0;
		this.Monday = 1;
		this.Tuesday = 2;
		this.Wednesday = 3;
		this.Thursday = 4;
		this.Friday = 5;
		this.Saturday = 6;
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

WorkingWeek.Shift.prototype.getStartTime = function() {
	return this.startTime;
}

WorkingWeek.Shift.prototype.getDuration = function() {
	return this.duration;
}

WorkingWeek.Shift.prototype.getEndTime = function() {
	return new Date(Date.parse(this.startTime) + this.duration.getTotalMilliseconds());
}

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

