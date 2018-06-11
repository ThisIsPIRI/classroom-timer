describe("classroomUtil", function() {
	describe("cutUp", function() {
		//TODO: split this up
		it("should cut up Strings to chunks of a fixed length", function() {
			chai.expect(cutUp("hello world sixch arslo ng", 6)).to.eql(["hello ", "world ", "sixch ", "arslo ", "ng"]);
			chai.expect(cutUp("비ASCII 문자열", 2)).to.eql(["비A", "SC", "II", " 문", "자열"]);
			chai.expect(cutUp("\n가\n나\n다", 1)).to.eql(["\n", "가", "\n", "나", "\n", "다"]);
			chai.expect(cutUp("test TEST", 100)).to.eql(["test TEST"]);
		});
		it("should return null if chunkLen is smaller than 0", function() {
			chai.expect(cutUp("abcdefg", 0)).to.equal(null);
		});
		it("should floor chunkLen if it isn't an integer", function() {
			chai.expect(cutUp("가나다", 1.403645)).to.eql(["가", "나", "다"]);
		});
	});
	describe("makeMenuString", function() {
		it("should separate entries with a <br>", function() {
			chai.expect(makeMenuString(["hello", "world", "안\n녕"])).to.eql("hello<br>world<br>안\n녕<br>");
		});
		it("should return an empty String when supplied with an empty Array or a non-Array", function() {
			chai.expect(makeMenuString()).to.equal("");
			chai.expect(makeMenuString(new Date(2018, 1, 1))).to.equal("");
			chai.expect(makeMenuString([])).to.equal("");
		});
	});
	describe("makeTimetableString", function() {
		it("should wrap the current class in <span>", function() {
			chai.expect(makeTimetableString(["hello", "world"], 1)).to.equal("hello, <span id=\"current\">world</span>");
		});
		it("should not wrap the current class if it doens't exist", function() {
			chai.expect(makeTimetableString(["hello", "world"], -403.54)).to.equal("hello, world");
		});
		it("should return an empty String if subjects is empty or not an Array", function() {
			chai.expect(makeTimetableString([], -403.54)).to.equal("");
			chai.expect(makeTimetableString()).to.equal("");
		});
	});
	describe("milFromMidnight", function() {
		it("should return the value of hours, minutes and seconds combined in milliseconds", function() {
			chai.expect(milFromMidnight(3, 43, 12)).to.equal(3 * 60 * 60 * 1000 + 43 * 60 * 1000 + 12 * 1000);
		});
		it("should do the same with one Date", function() {
			chai.expect(milFromMidnight(new Date(1685, 9, 23, 14, 54, 6))).to.equal(14 * 60 * 60 * 1000 + 54 * 60 * 1000 + 6000);
		});
		it("should assume seconds is 0 if it isn't given", function() {
			chai.expect(milFromMidnight(5, 33)).to.equal(5 * 60 * 60 * 1000 + 33 * 60 * 1000);
		});
		it("should ignore any other arguments when a Date is given", function() {
			chai.expect(milFromMidnight(new Date(2022, 1, 11, 17, 0, 0), 409, 43, 43)).to.equal(17 * 60 * 60 * 1000);
		});
	});
});