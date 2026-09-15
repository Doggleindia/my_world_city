import mongoose from 'mongoose'

// Per-article counters for the Insights section. The articles themselves live
// in data.js; only the numbers need a home in the database.
const ArticleStatSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true },
    views: { type: Number, default: 0 },
  },
  { timestamps: true },
)

export default mongoose.models.ArticleStat || mongoose.model('ArticleStat', ArticleStatSchema)
