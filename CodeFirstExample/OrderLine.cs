using NakedObjects;
using System.ComponentModel;
namespace CodeFirstExample
{
    /// <summary>
    /// 
    /// </summary>
    public class OrderLine
    {
        [Hidden] 
        public virtual int Id { get; set; }

        [Disabled]
        public virtual Order Order { get; set; }

        
        public virtual Product Product { get; set; }

       [DefaultValue(1)]
        public virtual int Quantity { get; set; }
      
    }
}
