describe("classroomUtil", function() {
	describe("cutUp()", function() {
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
	describe("makeMenuString()", function() {
		it("should separate entries with a <br>", function() {
			chai.expect(makeMenuString(["hello", "world", "안\n녕"])).to.eql("hello<br>world<br>안\n녕<br>");
		});
		it("should return an empty String when supplied with an empty Array or a non-Array", function() {
			chai.expect(makeMenuString()).to.equal("");
			chai.expect(makeMenuString(new Date(2018, 1, 1))).to.equal("");
			chai.expect(makeMenuString([])).to.equal("");
		});
	});
});