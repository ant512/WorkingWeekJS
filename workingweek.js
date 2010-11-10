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
	 * @param start The start time of the shift.
	 * @param duration A TimeSpan representing the duration of the shift.
	 */
	Shift: function(start, duration) {
		this.start = start;
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
		this.duration = new TimeSpan();
	}
}

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
