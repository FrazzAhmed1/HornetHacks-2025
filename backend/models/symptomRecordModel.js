import mongoose from "mongoose";

const symptomRecordSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    encryptedSymptoms: {
      type: String,
      required: true,
    },
    encryptedResults: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const SymptomRecord = mongoose.model("SymptomRecord", symptomRecordSchema);
export default SymptomRecord;
