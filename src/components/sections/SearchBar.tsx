import { Input } from "../ui/input";
// import { AppContext } from "@/app/AppContext";

const SearchBar: React.FC = () => {
  // const context = useContext(AppContext);

  // if (!context) {
  //   throw new Error("AppContext must be used within an AppProvider");
  // }

  // const { YTSearchResults, setYTSearchResults } = context;
  return (
    <div>
      <div className="justify-center">
        <Input
          placeholder="Search"
          style={{
            width: "1340px",
            justifyContent: "right",
            height: "30px",
            backgroundColor: "#1C1C1C",
          }}
        ></Input>
      </div>
    </div>
  );
};
export default SearchBar;
