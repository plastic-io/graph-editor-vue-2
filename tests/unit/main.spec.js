import main from "@/main";
describe("Main instantiation", () => {
    it("Should exist and setup routes app etc.", () => {
        expect(main).toBeTruthy();
        expect(main.$store).toBeTruthy();
        expect(main.$store).toBeTruthy();
    });
});
