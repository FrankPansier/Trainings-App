// Pseudocode voor het formulier
function TrainingTemplateForm() {
  const [exercises, setExercises] = useState([]);
  const [templateName, setTemplateName] = useState("");

  const handleAddExercise = () => {
    // Voeg een nieuwe oefening toe aan de lijst
  };

  const handleSaveTemplate = async () => {
    // Sla het trainingsschema op in Supabase
  };

  return (
    <form onSubmit={handleSaveTemplate}>
      <input
        type="text"
        value={templateName}
        onChange={(e) => setTemplateName(e.target.value)}
        placeholder="Naam van het schema"
      />
      {exercises.map((exercise, index) => (
        // Render oefening velden
      ))}
      <button type="button" onClick={handleAddExercise}>
        Oefening toevoegen
      </button>
      <button type="submit">Schema opslaan</button>
    </form>
  );
}
