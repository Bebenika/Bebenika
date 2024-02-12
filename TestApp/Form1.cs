using BbnkBase;

namespace TestApp
{
    public partial class Form1 : Form
    {
        public Form1()
        {
            InitializeComponent();
        }


        private void Form1_Load(object sender, EventArgs e)
        {
            Cbbnk._Current_Session.Value = Cbbnk.Sys;
            Cbbnk MainApp = new Cbbnk("MainApp");
            SQLiteHelper a = new SQLiteHelper("DB", @"D:\\sqls\Bebenika.Db")
            {
                Parent=MainApp
            };

      

            //SQLiteHelper SQLiteHelper = new SQLiteHelper(@"D:\\sqls\Bebenika.Db");
            //if (!SQLiteHelper.TableExists("Objects"))
            //{
            //    var columns = new Dictionary<string, string>
            //    {
            //        { "ID", "INTEGER PRIMARY KEY AUTOINCREMENT" },
            //        { "ParentID", "INTEGER" },
            //        { "CreatorID", "INTEGER" },
            //        { "Name", "TEXT" },
            //        { "Value", "BLOB" } // BLOB, byte[] veya büyük metinler için kullan?labilir.
            //    };
            //    SQLiteHelper.CreateTable("Objects", columns);
            //}
        }

        private void button1_Click(object sender, EventArgs e)
        {
            GC.Collect();
            GC.WaitForPendingFinalizers();
        }
    }
}
